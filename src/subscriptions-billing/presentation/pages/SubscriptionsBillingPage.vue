<script setup>
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import Message from 'primevue/message'
import Tag from 'primevue/tag'
import { useSubscriptionsBillingStore } from '../../application/subscriptions-billing.store'

const { t } = useI18n()
const billingStore = useSubscriptionsBillingStore()

onMounted(() => {
  billingStore.fetchPlans()
})

const activePlanId = computed(() => billingStore.activeSubscription?.planId ?? '')
</script>

<template>
  <section class="bt-billing-page">
    <header class="bt-patient-heading">
      <div>
        <p class="microcopy">{{ t('billing.eyebrow') }}</p>
        <h1>{{ t('billing.title') }}</h1>
        <p class="text-muted">{{ t('billing.subtitle') }}</p>
      </div>
    </header>

    <Message v-if="billingStore.error" severity="error" class="bt-billing-message">
      {{ billingStore.error }}
    </Message>

    <Message v-if="billingStore.subscribedRecently" severity="success" class="bt-billing-message">
      <strong>{{ t('billing.subscriptionActivated') }}</strong>
      <span>
        {{ t('billing.subscriptionDetail', { planName: billingStore.billingSummary?.planName, renewsAt: billingStore.billingSummary?.renewsAt }) }}
      </span>
    </Message>

    <section class="bt-pricing-grid">
      <article
        v-for="plan in billingStore.plans"
        :key="plan.id"
        class="bt-price-card"
        :class="{ 'bt-price-card--active': activePlanId === plan.id || plan.featured }"
      >
        <Tag v-if="activePlanId === plan.id" :value="t('billing.activePlanTag')" severity="success" />
        <span>{{ plan.name }}</span>
        <strong>S/ {{ plan.price }}<small>{{ t('billing.perMonth') }}</small></strong>
        <p>{{ plan.description }}</p>
        <Button
          :label="activePlanId === plan.id ? t('billing.active') : t('billing.select')"
          :loading="billingStore.loading"
          :outlined="activePlanId !== plan.id"
          @click="billingStore.subscribeToPlan(plan.id)"
        />
      </article>
    </section>

    <section v-if="billingStore.billingSummary" class="bt-billing-summary">
      <div>
        <h3>{{ t('billing.currentSubscription', { planName: billingStore.billingSummary.planName, paymentStatus: billingStore.billingSummary.paymentStatus }) }}</h3>
        <p>
          {{ t('billing.cardEnding', { last4: billingStore.billingSummary.cardLastFourDigits, paidAt: billingStore.billingSummary.paidAt, renewsAt: billingStore.billingSummary.renewsAt }) }}
        </p>
      </div>
      <Button :label="t('billing.viewInvoice')" />
    </section>
  </section>
</template>
