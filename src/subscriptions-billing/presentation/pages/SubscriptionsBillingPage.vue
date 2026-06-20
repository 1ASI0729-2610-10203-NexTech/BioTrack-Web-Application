<script setup>
import { computed, onMounted } from 'vue'
import Button from 'primevue/button'
import Message from 'primevue/message'
import Tag from 'primevue/tag'
import { useSubscriptionsBillingStore } from '../../application/subscriptions-billing.store'

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
        <p class="microcopy">Facturacion</p>
        <h1>Contratar plan</h1>
        <p class="text-muted">Elige el plan que mejor se adapta a tus necesidades.</p>
      </div>
    </header>

    <Message v-if="billingStore.error" severity="error" class="bt-billing-message">
      {{ billingStore.error }}
    </Message>

    <Message v-if="billingStore.subscribedRecently" severity="success" class="bt-billing-message">
      <strong>¡Suscripcion activada exitosamente!</strong>
      <span>
        Plan {{ billingStore.billingSummary?.planName }} activado. Tu suscripcion vence el
        {{ billingStore.billingSummary?.renewsAt }}.
      </span>
    </Message>

    <section class="bt-pricing-grid">
      <article
        v-for="plan in billingStore.plans"
        :key="plan.id"
        class="bt-price-card"
        :class="{ 'bt-price-card--active': activePlanId === plan.id || plan.featured }"
      >
        <Tag v-if="activePlanId === plan.id" value="Plan activo" severity="success" />
        <span>{{ plan.name }}</span>
        <strong>S/ {{ plan.price }}<small>/mes</small></strong>
        <p>{{ plan.description }}</p>
        <Button
          :label="activePlanId === plan.id ? 'Activo' : 'Seleccionar'"
          :loading="billingStore.loading"
          :outlined="activePlanId !== plan.id"
          @click="billingStore.subscribeToPlan(plan.id)"
        />
      </article>
    </section>

    <section v-if="billingStore.billingSummary" class="bt-billing-summary">
      <div>
        <h3>Plan {{ billingStore.billingSummary.planName }} - {{ billingStore.billingSummary.paymentStatus }}</h3>
        <p>
          Tarjeta terminada en {{ billingStore.billingSummary.cardLastFourDigits }} ·
          {{ billingStore.billingSummary.paidAt }} · Proxima renovacion:
          {{ billingStore.billingSummary.renewsAt }}
        </p>
      </div>
      <Button label="Ver factura" />
    </section>
  </section>
</template>
