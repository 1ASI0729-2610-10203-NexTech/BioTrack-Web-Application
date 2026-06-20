import { apiService } from '../../shared/infrastructure/api.service'

export const subscriptionsBillingApiService = {
  async fetchPlans() {
    const plans = await apiService.get('/subscriptions/plans')
    return Array.isArray(plans) ? plans : []
  },

  async fetchActiveSubscription(_userId) {
    const raw = await apiService.get('/subscriptions/active')
    if (!raw) return null
    return {
      entity: {
        planId: raw.planId,
        planName: raw.planName,
        status: raw.status,
        activatedAt: raw.startDate,
        renewsAt: raw.nextBillingDate,
      },
      payments: (raw.payments ?? []).map((p) => ({
        amount: p.amount,
        paidAt: p.paid_at ?? p.paidAt,
        cardLastFourDigits: '----',
      })),
      invoice: null,
    }
  },

  async subscribeToPlan({ plan }) {
    const startDate = new Date().toISOString().slice(0, 10)
    const sub = await apiService.post('/subscriptions/activate', { planId: plan.id, startDate })
    return {
      subscription: {
        id: sub.id,
        status: sub.status ?? 'ACTIVE',
        nextRenewalAt: sub.nextBillingDate,
      },
      payment: {
        amount: plan.price,
        paidAt: startDate,
        cardLastFourDigits: '****',
      },
      invoice: {
        number: `INV-${sub.id ?? Date.now()}`,
        issuedAt: startDate,
      },
    }
  },

  async activateSubscription(planId, startDate) {
    return apiService.post('/subscriptions/activate', { planId, startDate })
  },

  async suspendSubscription(subscriptionId) {
    return apiService.patch(`/subscriptions/${subscriptionId}/suspend`)
  },

  async reactivateSubscription(subscriptionId) {
    return apiService.patch(`/subscriptions/${subscriptionId}/reactivate`)
  },

  async processRenewal(subscriptionId) {
    return apiService.post(`/subscriptions/${subscriptionId}/renewal`)
  },

  async fetchBillingSummary(subscriptionId) {
    return apiService.get(`/subscriptions/${subscriptionId}/billing-summary`)
  },
}
