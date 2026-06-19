import { apiService } from '../../shared/infrastructure/api.service'

export const subscriptionsBillingApiService = {
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
