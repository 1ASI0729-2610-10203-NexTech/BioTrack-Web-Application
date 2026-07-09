import { apiService } from '../../shared/infrastructure/api.service'
import { SubscriptionPlan } from '../domain/model/subscription-plan.entity'

const ACTIVE_STATUS = 'ACTIVE'

function addMonths(dateStr, months) {
  const d = new Date(dateStr)
  d.setMonth(d.getMonth() + months)
  return d.toISOString().slice(0, 10)
}

const PLANS = [
  new SubscriptionPlan({
    id: 'free',
    code: 'FREE',
    name: 'Free',
    nameKey: 'billing.plans.free.name',
    price: 0,
    description: 'Starter access for new accounts.',
    descriptionKey: 'billing.plans.free.description',
    featured: false,
    contactOnly: false,
    internal: false,
    features: ['billing.plans.free.feature1', 'billing.plans.free.feature2', 'billing.plans.free.feature3'],
    disabledFeatures: [],
  }),
  new SubscriptionPlan({
    id: 'basic',
    code: 'BASIC',
    name: 'Basic',
    nameKey: 'billing.plans.basic.name',
    price: 19.9,
    description: 'For patients starting with basic nutritional tracking.',
    descriptionKey: 'billing.plans.basic.description',
    featured: false,
    contactOnly: false,
    internal: false,
    features: [
      'billing.plans.basic.feature1',
      'billing.plans.basic.feature2',
      'billing.plans.basic.feature3',
      'billing.plans.basic.feature4',
    ],
    disabledFeatures: ['billing.plans.basic.disabled1', 'billing.plans.basic.disabled2'],
  }),
  new SubscriptionPlan({
    id: 'premium',
    code: 'PREMIUM',
    name: 'Premium',
    nameKey: 'billing.plans.premium.name',
    price: 39.9,
    description: 'For patients who need more tracking and reminders.',
    descriptionKey: 'billing.plans.premium.description',
    featured: true,
    contactOnly: false,
    internal: false,
    features: [
      'billing.plans.premium.feature1',
      'billing.plans.premium.feature2',
      'billing.plans.premium.feature3',
      'billing.plans.premium.feature4',
      'billing.plans.premium.feature5',
      'billing.plans.premium.feature6',
    ],
    disabledFeatures: [],
  }),
]

export const subscriptionsBillingApiService = {
  async fetchPlans() {
    return PLANS
  },

  async fetchActiveSubscription(_userId, _opts) {
    return null
  },

  async subscribeToPlan({ userId, plan }) {
    const startDate = new Date().toISOString().slice(0, 10)
    const subscription = await apiService.post('/subscriptions', {
      userId,
      planId: plan.id,
      startDate,
      status: ACTIVE_STATUS,
    })

    let billing = null
    try {
      billing = await apiService.get(`/subscriptions/${subscription.id}/billing-summary`)
    } catch (_) {}

    const paidAt = billing?.paidAt ?? billing?.activatedAt ?? startDate
    const nextRenewalAt = billing?.nextRenewalAt ?? addMonths(startDate, 1)

    return {
      subscription: {
        id: subscription.id,
        status: subscription.status ?? ACTIVE_STATUS,
        nextRenewalAt,
      },
      payment: {
        amount: plan.price,
        paidAt,
        cardLastFourDigits: billing?.cardLastFourDigits ?? '----',
      },
      invoice: {
        number: billing?.invoiceNumber ?? null,
        issuedAt: billing?.issuedAt ?? paidAt,
      },
    }
  },

  async suspendSubscription(subscriptionId) {
    return apiService.patch(`/subscriptions/${subscriptionId}`, { status: 'Suspended' })
  },

  async reactivateSubscription(subscriptionId) {
    return apiService.patch(`/subscriptions/${subscriptionId}`, { status: 'Active' })
  },

  async processRenewal(subscriptionId) {
    return apiService.post(`/subscriptions/${subscriptionId}/renewal`, {})
  },

  async fetchBillingSummary(subscriptionId) {
    return apiService.get(`/subscriptions/${subscriptionId}/billing-summary`)
  },

  async activateSubscription(planId, startDate) {
    return apiService.post('/subscriptions', { planId, startDate, status: ACTIVE_STATUS })
  },
}
