import { defineStore } from 'pinia'
import { SubscriptionPlan } from '../domain/model/subscription-plan.entity'
import { IndividualSubscription } from '../domain/model/individual-subscription.entity'
import { Payment } from '../domain/model/payment.entity'
import { Invoice } from '../domain/model/invoice.entity'
import { useIdentityAccessStore } from '../../identity-access/application/identity-access.store'
import { usePatientPlanStore } from '../../nutritional-planning/application/patient-plan.store'
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
      this.error = ''
      try {
        const identityStore = useIdentityAccessStore()
        this.plans = await subscriptionsBillingApiService.fetchPlans()
        const userId = identityStore.currentUser?.id
        if (!userId) throw new Error('No existe un usuario autenticado.')
        const active = await subscriptionsBillingApiService.fetchActiveSubscription(userId)
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
        return this.plans
      } catch {
        this.error = 'No se pudieron cargar los planes.'
        this.plans = []
        this.activeSubscription = null
      } finally {
        this.loading = false
      }
    },
    async subscribeToPlan(planId) {
      this.loading = true
      this.error = ''
      this.subscribedRecently = false
      try {
        if (!this.plans.length) await this.fetchPlans()

        const selectedPlan = this.plans.find((plan) => plan.id === planId)
        if (!selectedPlan) {
          this.error = 'No se encontro el plan seleccionado.'
          return false
        }

        const identityStore = useIdentityAccessStore()
        const userId = identityStore.currentUser?.id
        if (!userId) {
          this.error = 'Debes iniciar sesion para activar una suscripcion.'
          return false
        }
        const persisted = await subscriptionsBillingApiService.subscribeToPlan({
          userId,
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
        await usePatientPlanStore().fetchPatientPlan()
        return true
      } catch (error) {
        this.error = error?.message ?? 'No se pudo activar la suscripcion.'
        return false
      } finally {
        this.loading = false
      }
    },
    getBillingSummary() {
      return this.billingSummary
    },
  },
})
