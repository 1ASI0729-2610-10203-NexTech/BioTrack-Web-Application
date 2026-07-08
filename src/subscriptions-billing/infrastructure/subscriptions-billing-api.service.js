import { apiService } from '../../shared/infrastructure/api.service'
import { SubscriptionPlan } from '../domain/model/subscription-plan.entity'

const FREE_PLAN_ID = 'free'
const ACTIVE_STATUS = 'ACTIVE'

function addMonths(date, months) {
  const next = new Date(date)
  next.setMonth(next.getMonth() + months)
  return next.toISOString().slice(0, 10)
}

function normalizePlan(plan) {
  return new SubscriptionPlan({
    id: plan.id,
    code: plan.code,
    name: plan.name,
    nameKey: plan.nameKey,
    price: Number(plan.price ?? 0),
    description: plan.description,
    descriptionKey: plan.descriptionKey,
    featured: Boolean(plan.featured),
    contactOnly: Boolean(plan.contactOnly),
    internal: Boolean(plan.internal),
    features: plan.features ?? [],
    disabledFeatures: plan.disabledFeatures ?? [],
  })
}

async function fetchActiveSubscriptionRecord(userId) {
  const subscriptions = await apiService.get('/subscriptions', {
    params: { userId, status: ACTIVE_STATUS },
  })
  return Array.isArray(subscriptions) ? subscriptions[subscriptions.length - 1] : null
}

async function fetchPlanById(planId) {
  if (!planId) return null
  const plan = await apiService.get(`/subscriptionPlans/${planId}`)
  return plan ? normalizePlan(plan) : null
}

async function fetchPayments(subscriptionId) {
  const payments = await apiService.get('/payments', { params: { subscriptionId } })
  return Array.isArray(payments) ? payments : []
}

async function fetchInvoice(subscriptionId) {
  const invoices = await apiService.get('/invoices', { params: { subscriptionId } })
  return Array.isArray(invoices) ? invoices[0] ?? null : null
}

async function deactivateCurrentSubscription(userId) {
  const current = await fetchActiveSubscriptionRecord(userId)
  if (current?.id) {
    await apiService.patch(`/subscriptions/${current.id}`, { status: 'REPLACED' })
  }
}

async function createSubscription({ userId, plan, status = ACTIVE_STATUS }) {
  const startDate = new Date().toISOString().slice(0, 10)
  return apiService.post('/subscriptions', {
    userId,
    planId: plan.id,
    status,
    startedAt: startDate,
    nextRenewalAt: plan.price > 0 ? addMonths(startDate, 1) : null,
  })
}

async function createPayment({ subscription, plan }) {
  if (plan.price <= 0) return null
  const paidAt = new Date().toISOString().slice(0, 10)
  return apiService.post('/payments', {
    subscriptionId: subscription.id,
    userId: subscription.userId,
    planId: plan.id,
    amount: plan.price,
    currency: 'PEN',
    status: 'PAID',
    paidAt,
    cardLastFourDigits: '4521',
  })
}

async function createInvoice({ subscription, payment }) {
  if (!payment) return null
  const issuedAt = payment.paidAt
  return apiService.post('/invoices', {
    subscriptionId: subscription.id,
    number: `INV-${issuedAt.replaceAll('-', '')}-${subscription.id}`,
    issuedAt,
    status: 'PAID',
  })
}

export const subscriptionsBillingApiService = {
  async fetchPlans() {
    const plans = await apiService.get('/subscriptionPlans')
    return Array.isArray(plans)
      ? plans.map(normalizePlan).filter((plan) => !plan.internal)
      : []
  },

  async fetchActiveSubscription(userId, { ensureFree = false } = {}) {
    let raw = await fetchActiveSubscriptionRecord(userId)

    if (!raw && ensureFree) {
      const freePlan = await fetchPlanById(FREE_PLAN_ID)
      raw = await createSubscription({ userId, plan: freePlan })
    }

    if (!raw) return null

    const plan = await fetchPlanById(raw.planId)
    const payments = await fetchPayments(raw.id)
    const invoice = await fetchInvoice(raw.id)

    return {
      entity: {
        planId: raw.planId,
        planName: plan?.name ?? raw.planName,
        planNameKey: plan?.nameKey,
        status: raw.status,
        activatedAt: raw.startedAt ?? raw.startDate,
        renewsAt: raw.nextRenewalAt ?? raw.nextBillingDate,
      },
      payments: payments.map((p) => ({
        amount: p.amount,
        paidAt: p.paidAt ?? p.paid_at,
        cardLastFourDigits: p.cardLastFourDigits ?? '----',
      })),
      invoice,
    }
  },

  async subscribeToPlan({ userId, plan }) {
    await deactivateCurrentSubscription(userId)
    const subscription = await createSubscription({ userId, plan })
    const payment = await createPayment({ subscription, plan })
    const invoice = await createInvoice({ subscription, payment })

    return {
      subscription: {
        id: subscription.id,
        status: subscription.status,
        nextRenewalAt: subscription.nextRenewalAt,
      },
      payment: {
        amount: plan.price,
        paidAt: payment?.paidAt ?? subscription.startedAt,
        cardLastFourDigits: payment?.cardLastFourDigits ?? '----',
      },
      invoice: {
        number: invoice?.number ?? null,
        issuedAt: invoice?.issuedAt ?? null,
      },
    }
  },

  async activateSubscription(planId, startDate) {
    return apiService.post('/subscriptions', { planId, startDate, status: ACTIVE_STATUS })
  },

  async suspendSubscription(subscriptionId) {
    return apiService.patch(`/subscriptions/${subscriptionId}`, { status: 'SUSPENDED' })
  },

  async reactivateSubscription(subscriptionId) {
    return apiService.patch(`/subscriptions/${subscriptionId}`, { status: ACTIVE_STATUS })
  },

  async processRenewal(subscriptionId) {
    return apiService.post('/payments', { subscriptionId, status: 'PAID' })
  },

  async fetchBillingSummary(subscriptionId) {
    const payments = await fetchPayments(subscriptionId)
    const invoice = await fetchInvoice(subscriptionId)
    return { payments, invoice }
  },
}
