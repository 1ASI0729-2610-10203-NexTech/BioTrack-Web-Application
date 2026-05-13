import { defineStore } from 'pinia'
import { SubscriptionPlan } from '../domain/model/subscription-plan.entity'
import { IndividualSubscription } from '../domain/model/individual-subscription.entity'
import { Payment } from '../domain/model/payment.entity'
import { Invoice } from '../domain/model/invoice.entity'

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
      if (this.plans.length) return this.plans
      this.plans = [
        new SubscriptionPlan({
          id: 'basic',
          name: 'Basico',
          price: 29,
          description: 'Para empezar tu camino',
        }),
        new SubscriptionPlan({
          id: 'professional',
          name: 'Profesional',
          price: 59,
          description: 'Nutricionista + seguimiento completo',
          featured: true,
        }),
        new SubscriptionPlan({
          id: 'premium',
          name: 'Premium',
          price: 99,
          description: 'Maximo rendimiento',
        }),
      ]
      return this.plans
    },
    async subscribeToPlan(planId) {
      this.loading = true
      this.error = ''
      this.subscribedRecently = false
      await this.fetchPlans()
      await new Promise((resolve) => setTimeout(resolve, 500))

      const selectedPlan = this.plans.find((plan) => plan.id === planId)
      if (!selectedPlan) {
        this.error = 'No se encontro el plan seleccionado.'
        this.loading = false
        return false
      }

      const paymentDate = '24/04/2026'
      const renewsAt = '24/05/2026'
      this.activeSubscription = new IndividualSubscription({
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        status: 'ACTIVA',
        activatedAt: paymentDate,
        renewsAt,
      })
      this.payments = [
        new Payment({
          planName: selectedPlan.name,
          amount: selectedPlan.price,
          paidAt: paymentDate,
          cardLastFourDigits: '4521',
        }),
      ]
      this.billingSummary = {
        planName: selectedPlan.name,
        paymentStatus: 'Pago procesado',
        cardLastFourDigits: '4521',
        paidAt: paymentDate,
        renewsAt,
        invoice: new Invoice({ number: 'INV-2026-001', issuedAt: paymentDate }),
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
