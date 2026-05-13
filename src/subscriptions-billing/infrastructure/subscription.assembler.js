import {
  CorporateSubscription,
  IndividualSubscription,
} from '../domain/model/subscriptions-billing.entity'

export const SubscriptionAssembler = {
  fromApi(payload) {
    return payload.kind === 'corporate'
      ? new CorporateSubscription(payload)
      : new IndividualSubscription(payload)
  },
}
