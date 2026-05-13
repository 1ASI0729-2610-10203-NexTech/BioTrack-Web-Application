import { apiService } from '../../shared/infrastructure/api.service'
import { SubscriptionPlan } from '../domain/model/subscription-plan.entity'
import { IndividualSubscription } from '../domain/model/individual-subscription.entity'
import { Payment } from '../domain/model/payment.entity'
import { Invoice } from '../domain/model/invoice.entity'

export const subscriptionsBillingApiService = {
  async fetchPlans() {
    const plans = await apiService.get('/subscription-plans')
    return plans.map(
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

  async fetchActiveSubscription(userId) {
    const subscriptions = await apiService.get('/subscriptions')
    const subscription = subscriptions.find((candidate) => candidate.userId === userId)
    if (!subscription) return null
    const plans = await apiService.get('/subscription-plans')
    const plan = plans.find((candidate) => candidate.id === subscription.planId)
    const payments = (await apiService.get('/payments')).filter(
      (payment) => payment.subscriptionId === subscription.id,
    )
    const invoice = (await apiService.get('/invoices')).find(
      (candidate) => candidate.subscriptionId === subscription.id,
    )

    return {
      subscription,
      entity: new IndividualSubscription({
        planId: subscription.planId,
        planName: plan?.name ?? 'Plan activo',
        status: subscription.status,
        activatedAt: subscription.startedAt,
        renewsAt: subscription.nextRenewalAt,
      }),
      payments: payments.map(
        (payment) =>
          new Payment({
            planName: plan?.name ?? 'Plan activo',
            amount: payment.amount,
            paidAt: payment.paidAt,
            cardLastFourDigits: payment.cardLastFourDigits,
          }),
      ),
      invoice: invoice
        ? new Invoice({
            number: invoice.number,
            issuedAt: invoice.issuedAt,
          })
        : null,
    }
  },

  async subscribeToPlan({ userId, plan }) {
    const existing = (await apiService.get('/subscriptions')).filter(
      (subscription) => subscription.userId === userId,
    )
    const today = new Date().toISOString().slice(0, 10)
    const renewalDate = new Date()
    renewalDate.setMonth(renewalDate.getMonth() + 1)
    const nextRenewalAt = renewalDate.toISOString().slice(0, 10)

    const subscription = existing[0]
      ? await apiService.patch(`/subscriptions/${existing[0].id}`, {
          planId: plan.id,
          status: 'ACTIVE',
          startedAt: today,
          nextRenewalAt,
        })
      : await apiService.post('/subscriptions', {
          userId,
          planId: plan.id,
          status: 'ACTIVE',
          startedAt: today,
          nextRenewalAt,
        })

    const payment = await apiService.post('/payments', {
      subscriptionId: subscription.id,
      userId,
      planId: plan.id,
      amount: plan.price,
      currency: 'PEN',
      status: 'PAID',
      paidAt: today,
      cardLastFourDigits: '4521',
    })

    const invoice = await apiService.post('/invoices', {
      subscriptionId: subscription.id,
      number: `INV-${today.replaceAll('-', '')}-${subscription.id}`,
      issuedAt: today,
      status: 'PAID',
    })

    return { subscription, payment, invoice }
  },
}
