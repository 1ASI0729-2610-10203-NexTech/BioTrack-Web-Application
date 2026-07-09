import { defineStore } from 'pinia'
import { IndividualSubscription } from '../domain/model/individual-subscription.entity'
import { Payment } from '../domain/model/payment.entity'
import { Invoice } from '../domain/model/invoice.entity'
import { useIdentityAccessStore } from '../../identity-access/application/identity-access.store'
import { usePatientPlanStore } from '../../nutritional-planning/application/patient-plan.store'
import { t } from '../../locales'
import { subscriptionsBillingApiService } from '../infrastructure/subscriptions-billing-api.service'

export const useSubscriptionsBillingStore = defineStore('subscriptions-billing', {
  state: () => ({
    plans: [],
    activeSubscription: null,
    payments: [],
    billingSummary: null,
    loading: false,
    error: '',
    info: '',
    subscribedRecently: false,
  }),
  getters: {
    isPremiumActive(state) {
      return state.activeSubscription?.planId === 'premium'
    },
  },
  actions: {
    async fetchPlans() {
      this.loading = true
      this.error = ''
      this.info = ''
      try {
        const identityStore = useIdentityAccessStore()
        this.plans = await subscriptionsBillingApiService.fetchPlans()
        const userId = identityStore.currentUser?.id
        if (!userId) throw new Error(t('auth.userRequired'))
        const isPatient = ['PACIENTE', 'PATIENT'].includes(identityStore.currentUser?.role)
        const active = await subscriptionsBillingApiService.fetchActiveSubscription(userId, {
          ensureFree: isPatient,
        })
        this.activeSubscription = active?.entity ?? null
        this.payments = active?.payments ?? []
        this.billingSummary = active
          ? {
              planName: active.entity.planNameKey ? t(active.entity.planNameKey) : active.entity.planName,
              paymentStatus: active.payments.length
                ? t('billing.status.paymentProcessed')
                : t('billing.status.noPaymentRequired'),
              cardLastFourDigits: active.payments[0]?.cardLastFourDigits ?? '----',
              paidAt: active.payments[0]?.paidAt ?? active.entity.activatedAt,
              renewsAt: active.entity.renewsAt ?? t('billing.notApplicable'),
              invoice: active.invoice,
              hasPayment: active.payments.length > 0,
            }
          : null
        return this.plans
      } catch {
        this.error = t('billing.errors.loadPlans')
        this.plans = []
        this.activeSubscription = null
      } finally {
        this.loading = false
      }
    },
    async subscribeToPlan(planId) {
      this.loading = true
      this.error = ''
      this.info = ''
      this.subscribedRecently = false
      try {
        if (!this.plans.length) await this.fetchPlans()

        const selectedPlan = this.plans.find((plan) => plan.id === planId)
        if (!selectedPlan) {
          this.error = t('billing.errors.selectedPlanNotFound')
          return false
        }

        if (selectedPlan.contactOnly) {
          this.info = t('billing.contactRequired')
          return false
        }

        const identityStore = useIdentityAccessStore()
        const userId = identityStore.currentUser?.id
        const isPatient = ['PACIENTE', 'PATIENT'].includes(identityStore.currentUser?.role)
        if (!userId) {
          this.error = t('billing.errors.loginRequired')
          return false
        }
        if (!isPatient) {
          this.info = t('billing.managedPlanOnly')
          return false
        }
        const persisted = await subscriptionsBillingApiService.subscribeToPlan({
          userId,
          plan: selectedPlan,
        })
        const paymentDate = persisted.payment.paidAt
        const renewsAt = persisted.subscription.nextRenewalAt
        this.activeSubscription = new IndividualSubscription({
          planId: selectedPlan.id,
          planName: selectedPlan.nameKey ? t(selectedPlan.nameKey) : selectedPlan.name,
          status: persisted.subscription.status,
          activatedAt: paymentDate,
          renewsAt,
        })
        this.payments = [
          new Payment({
            planName: selectedPlan.nameKey ? t(selectedPlan.nameKey) : selectedPlan.name,
            amount: persisted.payment.amount,
            paidAt: paymentDate,
            cardLastFourDigits: persisted.payment.cardLastFourDigits,
          }),
        ]
        this.billingSummary = {
          planName: selectedPlan.nameKey ? t(selectedPlan.nameKey) : selectedPlan.name,
          paymentStatus: t('billing.status.paymentProcessed'),
          cardLastFourDigits: persisted.payment.cardLastFourDigits,
          paidAt: paymentDate,
          renewsAt,
          invoice: new Invoice({
            number: persisted.invoice.number,
            issuedAt: persisted.invoice.issuedAt,
          }),
          hasPayment: true,
        }
        this.subscribedRecently = true
        await usePatientPlanStore().fetchPatientPlan()
        return true
      } catch (error) {
        this.error = error?.message ?? t('billing.errors.activateSubscription')
        return false
      } finally {
        this.loading = false
      }
    },
    requestOrganizationContact() {
      this.error = ''
      this.info = t('billing.contactRequired')
      return false
    },
    getBillingSummary() {
      return this.billingSummary
    },
  },
})
