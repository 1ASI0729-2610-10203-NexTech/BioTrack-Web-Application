import { apiService } from '../../shared/infrastructure/api.service'
import { SubscriptionAssembler } from './subscription.assembler'

export const subscriptionsBillingApiService = {
  async fetchSubscription() {
    const payload = await apiService.get('/subscriptions-billing/current')
    return SubscriptionAssembler.fromApi(payload)
  },
}
