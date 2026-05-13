import { defineStore } from 'pinia'
import { subscriptionsBillingApiService } from '../infrastructure/subscriptions-billing-api.service'
import {
  activateSubscription,
  suspendAfterRenewalFailure,
} from '../domain/model/subscriptions-billing.entity'

export const useSubscriptionsBillingStore = defineStore('subscriptions-billing', {
  state: () => ({ subscription: null }),
  actions: {
    async loadSubscription() {
      this.subscription = await subscriptionsBillingApiService.fetchSubscription()
    },
    registerRenewalFailure() {
      if (this.subscription) suspendAfterRenewalFailure(this.subscription)
    },
    registerRegularizedPayment() {
      if (this.subscription) activateSubscription(this.subscription)
    },
  },
})
