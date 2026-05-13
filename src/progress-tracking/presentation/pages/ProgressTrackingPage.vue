<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import ProgressBar from 'primevue/progressbar'
import { usePatientPlanStore } from '../../../nutritional-planning/application/patient-plan.store'
import { usePatientProgressStore } from '../../application/patient-progress.store'

const router = useRouter()
const planStore = usePatientPlanStore()
const progressStore = usePatientProgressStore()

onMounted(async () => {
  await planStore.fetchPatientPlan()
  progressStore.calculateWeeklyAdherence()
  progressStore.calculateProgressSummary()
})
</script>

<template>
  <section class="bt-progress-page">
    <header class="bt-patient-heading">
      <div><p class="microcopy">US30 - US31</p><h1>Mi progreso</h1><p class="text-muted">Resumen semanal sin grafico real por ahora.</p></div>
    </header>
    <section v-if="!planStore.hasActivePlan" class="bt-lock-card">
      <div><p class="microcopy">Seguimiento bloqueado</p><h2>Aun no tienes un plan nutricional activo</h2><p class="text-muted">Cuando tu nutricionista active un plan, podras registrar actividad, peso y revisar tu adherencia.</p></div>
      <Button label="Ir a Plan Nutricional" @click="router.push('/nutritional-plan')" />
    </section>
    <template v-else>
      <section class="bt-progress-summary-grid">
        <article class="bt-patient-card"><span>Peso inicial</span><strong>{{ progressStore.initialWeight }} kg</strong></article>
        <article class="bt-patient-card"><span>Peso actual</span><strong>{{ progressStore.currentWeight }} kg</strong></article>
        <article class="bt-patient-card"><span>Meta</span><strong>{{ progressStore.targetWeight }} kg</strong></article>
        <article class="bt-patient-card bt-patient-card--blue"><span>Adherencia semanal</span><strong>{{ progressStore.weeklyAdherencePercentage.toFixed(0) }}%</strong><ProgressBar :value="progressStore.weeklyAdherencePercentage" /></article>
        <article class="bt-patient-card"><span>Dias registrados</span><strong>{{ progressStore.registeredDaysCount }}</strong></article>
        <article class="bt-patient-card"><span>Actividad semanal</span><strong>{{ progressStore.weeklyActivityMinutes }} min</strong></article>
        <article class="bt-patient-card"><span>Calorias quemadas</span><strong>{{ progressStore.weeklyBurnedCalories }} kcal</strong></article>
        <article class="bt-patient-card"><span>Estado general</span><strong>{{ progressStore.hasEnoughProgressData() ? 'En marcha' : 'Pendiente' }}</strong></article>
      </section>
      <section class="bt-progress-grid">
        <article class="bt-dashboard-panel bt-progress-placeholder"><h3>Grafico de progreso proximamente</h3><p class="text-muted">Por ahora mostramos un resumen textual semanal para validar el flujo.</p></article>
        <article class="bt-dashboard-panel">
          <h3>Acciones</h3>
          <div class="bt-inline-actions">
            <Button label="Registrar actividad" @click="router.push('/progress-tracking/activity')" />
            <Button label="Actualizar peso" outlined @click="router.push('/progress-tracking/weight')" />
            <Button label="Ver consumo diario" outlined @click="router.push('/food-log')" />
          </div>
        </article>
      </section>
    </template>
  </section>
</template>
