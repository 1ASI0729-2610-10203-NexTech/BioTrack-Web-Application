import { apiService } from '../../shared/infrastructure/api.service'
import { SubscriptionPlan } from '../domain/model/subscription-plan.entity'
import { IndividualSubscription } from '../domain/model/individual-subscription.entity'
import { Payment } from '../domain/model/payment.entity'
import { Invoice } from '../domain/model/invoice.entity'

export const subscriptionsBillingApiService = {
  async fetchPlans() {
    const plans = await apiService.get('/subscription-plans')
    return (Array.isArray(plans) ? plans : []).map(
      (plan) =>
        new SubscriptionPlan({
          id: plan.id,
          name: plan.name,
          price: plan.price,
          description: plan.description,
          featured: Boolean(plan.featured),
        }),
    )
  },

  // TS07 — GET /api/v1/subscriptions/{id}
  async fetchActiveSubscription(userId) {
    const subscriptions = await apiService.get('/subscriptions', {
      params: { userId, status: 'ACTIVE' },
    })
    const list = Array.isArray(subscriptions) ? subscriptions : []
    const active = list[0]
    if (!active) return null

    const detail = await apiService.get(`/subscriptions/${active.id}`)

    return {
      subscription: detail,
      entity: new IndividualSubscription({
        planId: detail.planId,
        planName: detail.planName ?? 'Plan activo',
        status: detail.status,
        activatedAt: detail.startedAt,
        renewsAt: detail.nextRenewalAt,
      }),
      payments: (detail.payments ?? []).map(
        (payment) =>
          new Payment({
            planName: detail.planName ?? 'Plan activo',
            amount: payment.amount,
            paidAt: payment.paidAt,
            cardLastFourDigits: payment.cardLastFourDigits,
          }),
      ),
      invoice: detail.invoice
        ? new Invoice({
            number: detail.invoice.number,
            issuedAt: detail.invoice.issuedAt,
          })
        : null,
    }
  },

  // TS07 — POST /api/v1/subscriptions/payments
  async subscribeToPlan({ userId, plan }) {
    const today = new Date().toISOString().slice(0, 10)
    return apiService.post('/subscriptions/payments', {
      userId,
      planId: plan.id,
      planName: plan.name,
      amount: plan.price,
      currency: 'PEN',
      paidAt: today,
    })
  },
}
