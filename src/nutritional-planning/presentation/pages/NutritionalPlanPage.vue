<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Message from 'primevue/message'
import Tag from 'primevue/tag'
import { useIdentityAccessStore } from '../../../identity-access/application/identity-access.store'
import { usePatientProfileStore } from '../../../patient-profile/application/patient-profile.store'
import { useSubscriptionsBillingStore } from '../../../subscriptions-billing/application/subscriptions-billing.store'
import { usePatientPlanStore } from '../../application/patient-plan.store'
import { usePatientProgressStore } from '../../../progress-tracking/application/patient-progress.store'

const router = useRouter()
const identityAccessStore = useIdentityAccessStore()
const patientProfileStore = usePatientProfileStore()
const billingStore = useSubscriptionsBillingStore()
const patientPlanStore = usePatientPlanStore()
const patientProgressStore = usePatientProgressStore()

onMounted(async () => {
  await identityAccessStore.refreshCurrentUser()
  await patientProfileStore.fetchPatientProfile()
  await billingStore.fetchPlans()
  const plan = await patientPlanStore.fetchPatientPlan()
  patientProgressStore.setDailyCalories(plan?.dailyCalories ?? 0)
})

const plan = computed(() => patientPlanStore.currentPlan)
const hasNutritionSubscription = computed(() =>
  ['Profesional', 'Premium'].includes(billingStore.activeSubscription?.planName),
)

async function acceptPlan() {
  await patientPlanStore.acceptPlan()
}
</script>

<template>
  <section class="bt-plan-page">
    <header class="bt-patient-heading">
      <div>
        <p class="microcopy">Plan nutricional</p>
        <h1>
          {{
            patientPlanStore.hasProposedPlan
              ? 'Revisar plan propuesto'
              : patientPlanStore.hasActivePlan
                ? 'Plan nutricional activo'
                : patientPlanStore.hasRejectedPlan
                  ? 'Plan nutricional rechazado'
                  : 'Plan nutricional'
          }}
        </h1>
        <p class="text-muted">
          {{
            patientPlanStore.hasProposedPlan
              ? 'Tu nutricionista ha preparado un plan personalizado para ti.'
              : patientPlanStore.hasActivePlan
                ? 'Tu plan ya esta disponible y listo para seguir.'
                : patientPlanStore.hasRejectedPlan
                  ? 'El plan fue rechazado y queda pendiente de actualización.'
                  : 'Aún no tienes un plan nutricional activo.'
          }}
        </p>
      </div>
      <Tag
        v-if="patientPlanStore.hasProposedPlan || patientPlanStore.hasActivePlan || patientPlanStore.hasRejectedPlan"
        :value="patientPlanStore.hasActivePlan ? 'Plan activo' : patientPlanStore.hasRejectedPlan ? 'Estado: Rechazado' : 'Estado: Propuesto'"
        :severity="patientPlanStore.hasActivePlan ? 'success' : patientPlanStore.hasRejectedPlan ? 'danger' : 'warn'"
      />
    </header>

    <section v-if="patientPlanStore.hasProposedPlan || patientPlanStore.hasActivePlan" class="bt-plan-grid">
      <article class="bt-dashboard-panel bt-plan-main-card">
        <div class="bt-panel-header">
          <div>
            <h3>{{ plan?.title }}</h3>
            <p class="text-muted">Elaborado por {{ plan?.nutritionist }} - {{ plan?.date }}</p>
          </div>
        </div>

        <div class="bt-plan-preview">
          <span>☀️ Avena + fruta</span>
          <span>🍽️ Pollo + arroz</span>
          <span>🌙 Ensalada</span>
        </div>

        <Message v-if="patientPlanStore.acceptedRecently" severity="success" class="bt-plan-message">
          <strong>Plan aceptado exitosamente</strong>
          <span>El plan quedo activado y ya esta disponible en tu Vista de Dieta Semanal.</span>
        </Message>

        <div v-if="patientPlanStore.hasProposedPlan" class="bt-plan-actions">
          <Button label="Aceptar plan" :loading="patientPlanStore.loading" @click="acceptPlan" />
          <Button label="Rechazar plan" outlined @click="patientPlanStore.rejectPlan()" />
        </div>
      </article>

      <aside class="bt-plan-side">
        <article class="bt-plan-highlight">
          <span>Calorias diarias</span>
          <strong>{{ plan?.dailyCalories }} kcal</strong>
          <small>Objetivo: {{ plan?.goal }}</small>
        </article>

        <article class="bt-dashboard-panel">
          <h3>Macronutrientes</h3>
          <div class="bt-macro-row"><span>Proteinas</span><strong>{{ plan?.macros.proteins }}%</strong></div>
          <div class="bt-goal-track bt-goal-track--blue"><span /></div>
          <div class="bt-macro-row"><span>Carbohidratos</span><strong>{{ plan?.macros.carbohydrates }}%</strong></div>
          <div class="bt-goal-track bt-goal-track--green"><span /></div>
          <div class="bt-macro-row"><span>Grasas</span><strong>{{ plan?.macros.fats }}%</strong></div>
          <div class="bt-goal-track bt-goal-track--warning"><span /></div>
        </article>

        <Button
          v-if="patientPlanStore.hasActivePlan"
          label="Ver mi dieta semanal"
          @click="router.push('/weekly-diet')"
        />
      </aside>
    </section>

    <section v-else-if="patientPlanStore.hasRejectedPlan" class="bt-empty-plan-layout">
      <article class="bt-empty-plan-card">
        <div class="bt-empty-icon">!</div>
        <h2>Plan rechazado</h2>
        <p>Tu plan nutricional fue rechazado. Cuando exista una nueva propuesta, aparecerá en esta sección.</p>
      </article>
    </section>

    <section v-else class="bt-empty-plan-layout">
      <article class="bt-empty-plan-card">
        <div class="bt-empty-icon">✓</div>
        <h2>Sin plan nutricional</h2>
        <p>Aún no tienes un plan nutricional activo.</p>
        <p v-if="!identityAccessStore.hasVerifiedAccount">
          Tu cuenta debe estar verificada antes de habilitar el flujo nutricional.
        </p>
        <p v-else-if="!patientProfileStore.isProfileComplete">
          Completa primero tu perfil de salud, objetivo nutricional y restricciones.
        </p>
        <p v-else-if="!hasNutritionSubscription">
          Tu perfil está listo. Contrata un plan Profesional o Premium para activar tu plan nutricional.
        </p>
        <p v-else>
          Tu suscripción está activa. Estamos preparando tu plan nutricional; vuelve a cargar esta vista si acabas de completar el proceso.
        </p>
        <Button label="Completar mi perfil de salud" @click="router.push('/patient-profile')" />
        <Button
          v-if="identityAccessStore.hasVerifiedAccount && patientProfileStore.isProfileComplete && !hasNutritionSubscription"
          label="Ir a Facturación"
          outlined
          @click="router.push('/subscriptions-billing')"
        />
      </article>
    </section>
  </section>
</template>
