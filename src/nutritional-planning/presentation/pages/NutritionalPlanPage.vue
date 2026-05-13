<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Message from 'primevue/message'
import Tag from 'primevue/tag'
import { usePatientPlanStore } from '../../application/patient-plan.store'
import { usePatientProgressStore } from '../../../progress-tracking/application/patient-progress.store'

const router = useRouter()
const patientPlanStore = usePatientPlanStore()
const patientProgressStore = usePatientProgressStore()

onMounted(async () => {
  const plan = await patientPlanStore.fetchPatientPlan()
  patientProgressStore.setDailyTargetCalories(plan?.targetCalories ?? 1850)
})

const plan = computed(() => patientPlanStore.currentPlan)

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
                : 'Vista de Dieta Semanal'
          }}
        </h1>
        <p class="text-muted">
          {{
            patientPlanStore.hasProposedPlan
              ? 'Tu nutricionista ha preparado un plan personalizado para ti.'
              : patientPlanStore.hasActivePlan
                ? 'Tu plan ya esta disponible y listo para seguir.'
                : 'Aun no tienes un plan nutricional activo.'
          }}
        </p>
      </div>
      <Tag
        :value="patientPlanStore.hasActivePlan ? 'Plan activo' : 'Estado: Propuesto'"
        :severity="patientPlanStore.hasActivePlan ? 'success' : 'warn'"
      />
    </header>

    <section v-if="patientPlanStore.hasProposedPlan || patientPlanStore.hasActivePlan" class="bt-plan-grid">
      <article class="bt-dashboard-panel bt-plan-main-card">
        <div class="bt-panel-header">
          <div>
            <h3>{{ plan?.title }}</h3>
            <p class="text-muted">Elaborado por {{ plan?.nutritionist }} - {{ plan?.date }}</p>
          </div>
          <Button label="Ver completo" outlined size="small" />
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
          <strong>{{ plan?.targetCalories }} kcal</strong>
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

    <section v-else class="bt-empty-plan-layout">
      <article class="bt-empty-plan-card">
        <div class="bt-empty-icon">✓</div>
        <h2>Sin plan nutricional</h2>
        <p>
          Aun no tienes un plan nutricional activo. Tu nutricionista asignado preparara una una vez que completes tu perfil de salud.
        </p>
        <Button label="Completar mi perfil de salud" @click="router.push('/patient-profile')" />
        <Button label="Ver estado de mi asignacion" outlined />
      </article>

      <aside class="bt-empty-plan-side">
        <article class="bt-dashboard-panel">
          <h3>Proximos pasos</h3>
          <ul class="bt-steps-list">
            <li><strong>Perfil de salud completado</strong><span>Datos biometricos registrados</span></li>
            <li><strong>Nutricionista asignado</strong><span>Dra. Ana Torres</span></li>
            <li><strong>Revision del nutricionista</strong><span>En espera</span></li>
            <li><strong>Plan nutricional propuesto</strong><span>Pendiente de creacion</span></li>
          </ul>
        </article>
        <Message severity="info">
          <strong>Tu nutricionista ya fue notificada</strong>
          <span>Dra. Ana Torres preparara tu plan en los proximos dias.</span>
        </Message>
      </aside>
    </section>
  </section>
</template>
