import { apiService } from '../../shared/infrastructure/api.service'
import { SubscriptionPlan } from '../domain/model/subscription-plan.entity'

const SUBSCRIPTION_ID_KEY = 'biotrack.active-subscription-id'
const API_PLAN_IDS = { free: 1, basic: 2, premium: 3 }
const PLAN_CATALOG = [
  {
    id: 'free',
    code: 'FREE',
    nameKey: 'billing.plans.free.name',
    descriptionKey: 'billing.plans.free.description',
    price: 0,
    features: [
      'billing.plans.free.feature1',
      'billing.plans.free.feature2',
      'billing.plans.free.feature3',
    ],
  },
  {
    id: 'basic',
    code: 'BASIC',
    nameKey: 'billing.plans.basic.name',
    descriptionKey: 'billing.plans.basic.description',
    price: 19.9,
    features: [
      'billing.plans.basic.feature1',
      'billing.plans.basic.feature2',
      'billing.plans.basic.feature3',
      'billing.plans.basic.feature4',
    ],
    disabledFeatures: ['billing.plans.basic.disabled1', 'billing.plans.basic.disabled2'],
  },
  {
    id: 'premium',
    code: 'PREMIUM',
    nameKey: 'billing.plans.premium.name',
    descriptionKey: 'billing.plans.premium.description',
    price: 39.9,
    featured: true,
    features: [
      'billing.plans.premium.feature1',
      'billing.plans.premium.feature2',
      'billing.plans.premium.feature3',
      'billing.plans.premium.feature4',
      'billing.plans.premium.feature5',
      'billing.plans.premium.feature6',
    ],
  },
]

function normalizePlan(plan) {
  return new SubscriptionPlan(plan)
}

function localPlanFromName(name) {
  return PLAN_CATALOG.find((plan) => plan.code === String(name ?? '').toUpperCase())
}

export const subscriptionsBillingApiService = {
  async fetchPlans() {
    return PLAN_CATALOG.map(normalizePlan)
  },

  async fetchActiveSubscription() {
    const subscriptionId = localStorage.getItem(SUBSCRIPTION_ID_KEY)
    if (!subscriptionId) return null

    const detail = await apiService.get(`/subscriptions/${subscriptionId}/billing-summary`)
    const plan = localPlanFromName(detail.planName)
    const payments = (detail.paymentHistory ?? []).map((payment) => ({
      amount: payment.amount,
      paidAt: payment.date,
      cardLastFourDigits: payment.transactionId?.slice(-4) ?? '----',
    }))
    return {
      entity: {
        planId: plan?.id ?? 'free',
        planName: detail.planName,
        planNameKey: plan?.nameKey,
        status: detail.status,
        activatedAt: detail.startDate,
        renewsAt: detail.nextBillingDate,
      },
      payments,
      invoice: null,
    }
  },

  async subscribeToPlan({ plan }) {
    const startDate = new Date().toISOString().slice(0, 10)
    const subscription = await apiService.post('/subscriptions', {
      planId: API_PLAN_IDS[plan.id],
      startDate,
    })
    localStorage.setItem(SUBSCRIPTION_ID_KEY, String(subscription.id))
    return {
      subscription: {
        id: subscription.id,
        status: subscription.status,
        nextRenewalAt: subscription.nextBillingDate,
      },
      payment: {
        amount: plan.price,
        paidAt: subscription.startDate ?? startDate,
        cardLastFourDigits: '----',
      },
      invoice: {
        number: `SUB-${subscription.id}`,
        issuedAt: subscription.startDate ?? startDate,
      },
    }
  },

  async activateSubscription(planId, startDate) {
    return apiService.post('/subscriptions', { planId, startDate })
  },

  async suspendSubscription(subscriptionId) {
    return apiService.patch(`/subscriptions/${subscriptionId}`, { status: 'Suspended' })
  },

  async reactivateSubscription(subscriptionId) {
    return apiService.patch(`/subscriptions/${subscriptionId}`, { status: 'Active' })
  },

  async processRenewal(subscriptionId) {
    return apiService.post(`/subscriptions/${subscriptionId}/renewal`)
  },

  async fetchBillingSummary(subscriptionId) {
    return apiService.get(`/subscriptions/${subscriptionId}/billing-summary`)
  },
}
