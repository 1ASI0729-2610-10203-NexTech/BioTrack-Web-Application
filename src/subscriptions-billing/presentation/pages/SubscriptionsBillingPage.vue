<script setup>
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { useIdentityAccessStore } from '../../../identity-access/application/identity-access.store'
import { useSubscriptionsBillingStore } from '../../application/subscriptions-billing.store'

const { t } = useI18n()
const billingStore = useSubscriptionsBillingStore()
const identityStore = useIdentityAccessStore()

onMounted(() => {
  billingStore.fetchPlans()
})

const activePlanId = computed(() => billingStore.activeSubscription?.planId ?? '')
const currentRole = computed(() => identityStore.currentUser?.role ?? '')
const isPatient = computed(() => ['PACIENTE', 'PATIENT'].includes(currentRole.value))
const isCorporate = computed(() => ['ADMIN_CORPORATIVO', 'ADMIN'].includes(currentRole.value))
const isNutritionist = computed(() => ['NUTRICIONISTA', 'NUTRITIONIST'].includes(currentRole.value))
const visiblePlans = computed(() => {
  if (isPatient.value) {
    return billingStore.plans.filter((plan) => ['free', 'basic', 'premium'].includes(plan.id))
  }

  if (isCorporate.value) {
    return billingStore.plans.filter((plan) => plan.id === activePlanId.value)
  }

  return []
})
const hasPlanCatalog = computed(() => visiblePlans.value.length > 0)
const pageTitle = computed(() => {
  if (isCorporate.value) return t('billing.organizationTitle')
  if (isNutritionist.value) return t('billing.staffTitle')
  return t('billing.title')
})
const pageSubtitle = computed(() => {
  if (isCorporate.value) return t('billing.organizationSubtitle')
  if (isNutritionist.value) return t('billing.staffSubtitle')
  return t('billing.subtitle')
})

function getPlanName(plan) {
  return plan.nameKey ? t(plan.nameKey) : plan.name
}

function getPlanDescription(plan) {
  return plan.descriptionKey ? t(plan.descriptionKey) : plan.description
}

function getPlanButtonLabel(plan) {
  if (activePlanId.value === plan.id) return t('billing.active')
  if (plan.contactOnly) return t('billing.contact')
  return plan.price <= 0 ? t('billing.included') : t('billing.select')
}

function handlePlanAction(plan) {
  if (activePlanId.value === plan.id) return
  if (!isPatient.value) return
  if (plan.contactOnly) {
    billingStore.requestOrganizationContact()
    return
  }
  billingStore.subscribeToPlan(plan.id)
}
</script>

<template>
  <section class="bt-billing-page">
    <header class="bt-patient-heading">
      <div>
        <p class="microcopy">{{ t('billing.eyebrow') }}</p>
        <h1>{{ pageTitle }}</h1>
        <p class="text-muted">{{ pageSubtitle }}</p>
      </div>
    </header>

    <Message v-if="billingStore.error" severity="error" class="bt-billing-message">
      {{ billingStore.error }}
    </Message>

    <Message v-if="billingStore.info" severity="info" class="bt-billing-message">
      {{ billingStore.info }}
    </Message>

    <Message v-if="billingStore.subscribedRecently" severity="success" class="bt-billing-message">
      <strong>{{ t('billing.subscriptionActivated') }}</strong>
      <span>
        {{ t('billing.subscriptionDetail', { planName: billingStore.billingSummary?.planName, renewsAt: billingStore.billingSummary?.renewsAt }) }}
      </span>
    </Message>

    <Message v-if="isNutritionist" severity="info" class="bt-billing-message">
      {{ t('billing.staffNoBilling') }}
    </Message>

    <section v-if="hasPlanCatalog" class="bt-pricing-grid" :class="{ 'bt-pricing-grid--single': visiblePlans.length === 1 }">
      <article
        v-for="plan in visiblePlans"
        :key="plan.id"
        class="bt-price-card"
        :class="{
          'bt-price-card--active': activePlanId === plan.id,
          'bt-price-card--featured': activePlanId !== plan.id && plan.featured,
        }"
      >
        <span v-if="activePlanId !== plan.id && plan.featured" class="bt-price-badge bt-price-badge--recommended">{{ t('billing.recommended') }}</span>
        <span>{{ getPlanName(plan) }}</span>
        <strong>
          <template v-if="plan.price > 0">S/ {{ plan.price.toFixed(2) }}<small>{{ t('billing.perMonth') }}</small></template>
          <template v-else>{{ t('billing.freePrice') }}</template>
        </strong>
        <p>{{ getPlanDescription(plan) }}</p>
        <ul v-if="plan.features.length || plan.disabledFeatures.length" class="bt-price-features">
          <li v-for="featureKey in plan.features" :key="featureKey">
            <i class="pi pi-check" aria-hidden="true"></i>
            <span>{{ t(featureKey) }}</span>
          </li>
          <li v-for="featureKey in plan.disabledFeatures" :key="featureKey" class="bt-price-feature-disabled">
            <i class="pi pi-times" aria-hidden="true"></i>
            <span>{{ t(featureKey) }}</span>
          </li>
        </ul>
        <Button
          :label="getPlanButtonLabel(plan)"
          :loading="billingStore.loading"
          :outlined="activePlanId !== plan.id"
          :class="{
            'bt-price-button--active': activePlanId === plan.id,
            'bt-price-button--select': activePlanId !== plan.id && plan.price > 0 && isPatient,
          }"
          :disabled="activePlanId === plan.id || plan.price <= 0 || !isPatient"
          @click="handlePlanAction(plan)"
        />
      </article>
    </section>

    <section v-if="billingStore.billingSummary" class="bt-billing-summary">
      <div>
        <h3>{{ t('billing.currentSubscription', { planName: billingStore.billingSummary.planName, paymentStatus: billingStore.billingSummary.paymentStatus }) }}</h3>
        <p v-if="billingStore.billingSummary.hasPayment">
          {{ t('billing.cardEnding', { last4: billingStore.billingSummary.cardLastFourDigits, paidAt: billingStore.billingSummary.paidAt, renewsAt: billingStore.billingSummary.renewsAt }) }}
        </p>
        <p v-else>
          {{ t('billing.noPaymentSummary', { activatedAt: billingStore.billingSummary.paidAt }) }}
        </p>
      </div>
      <Button :label="t('billing.viewInvoice')" />
    </section>
  </section>
</template>
