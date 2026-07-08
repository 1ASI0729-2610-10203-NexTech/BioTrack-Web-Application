import { apiService } from '../../shared/infrastructure/api.service'

export const subscriptionsBillingApiService = {
  // No subscription-plans endpoint in backend
  async fetchPlans() {
    return []
  },

  // No GET subscriptions list endpoint in backend
  async fetchActiveSubscription(_userId) {
    return null
  },

  // POST /api/v1/subscriptions
  async subscribeToPlan({ userId, plan }) {
    const today = new Date().toISOString().slice(0, 10)
    return apiService.post('/subscriptions', {
      userId,
      planId: plan.id,
      startedAt: today,
    })
  },
}
