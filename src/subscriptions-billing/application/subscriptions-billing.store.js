import { defineStore } from 'pinia'
import { SubscriptionPlan } from '../domain/model/subscription-plan.entity'
import { IndividualSubscription } from '../domain/model/individual-subscription.entity'
import { Payment } from '../domain/model/payment.entity'
import { Invoice } from '../domain/model/invoice.entity'
import { useIdentityAccessStore } from '../../identity-access/application/identity-access.store'
import { subscriptionsBillingApiService } from '../infrastructure/subscriptions-billing-api.service'

export const useSubscriptionsBillingStore = defineStore('subscriptions-billing', {
  state: () => ({
    plans: [],
    activeSubscription: null,
    payments: [],
    billingSummary: null,
    loading: false,
    error: '',
    subscribedRecently: false,
  }),
  getters: {
    isPremiumActive(state) {
      return state.activeSubscription?.planName === 'Premium'
    },
  },
  actions: {
    async fetchPlans() {
      this.loading = true
      const identityStore = useIdentityAccessStore()
      this.plans = await subscriptionsBillingApiService.fetchPlans()
      const active = await subscriptionsBillingApiService.fetchActiveSubscription(
        identityStore.currentUser?.id ?? 1,
      )
      this.activeSubscription = active?.entity ?? null
      this.payments = active?.payments ?? []
      this.billingSummary = active
        ? {
            planName: active.entity.planName,
            paymentStatus: active.payments.length ? 'Pago procesado' : 'Pendiente',
            cardLastFourDigits: active.payments[0]?.cardLastFourDigits ?? '----',
            paidAt: active.payments[0]?.paidAt ?? active.entity.activatedAt,
            renewsAt: active.entity.renewsAt,
            invoice: active.invoice,
          }
        : null
      this.loading = false
      return this.plans
    },
    async subscribeToPlan(planId) {
      this.loading = true
      this.error = ''
      this.subscribedRecently = false
      await this.fetchPlans()

      const selectedPlan = this.plans.find((plan) => plan.id === planId)
      if (!selectedPlan) {
        this.error = 'No se encontro el plan seleccionado.'
        this.loading = false
        return false
      }

      const identityStore = useIdentityAccessStore()
      const persisted = await subscriptionsBillingApiService.subscribeToPlan({
        userId: identityStore.currentUser?.id ?? 1,
        plan: selectedPlan,
      })
      const paymentDate = persisted.payment.paidAt
      const renewsAt = persisted.subscription.nextRenewalAt
      this.activeSubscription = new IndividualSubscription({
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        status: persisted.subscription.status,
        activatedAt: paymentDate,
        renewsAt,
      })
      this.payments = [
        new Payment({
          planName: selectedPlan.name,
          amount: persisted.payment.amount,
          paidAt: paymentDate,
          cardLastFourDigits: persisted.payment.cardLastFourDigits,
        }),
      ]
      this.billingSummary = {
        planName: selectedPlan.name,
        paymentStatus: 'Pago procesado',
        cardLastFourDigits: persisted.payment.cardLastFourDigits,
        paidAt: paymentDate,
        renewsAt,
        invoice: new Invoice({
          number: persisted.invoice.number,
          issuedAt: persisted.invoice.issuedAt,
        }),
      }
      this.subscribedRecently = true
      this.loading = false
      return true
    },
    getBillingSummary() {
      return this.billingSummary
    },
  },
})
