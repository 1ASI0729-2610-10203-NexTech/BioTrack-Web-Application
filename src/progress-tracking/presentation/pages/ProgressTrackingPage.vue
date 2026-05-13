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
  await progressStore.fetchProgressData()
  progressStore.calculateWeeklyAdherence()
  progressStore.calculateProgressSummary()
})

function formatKg(value) {
  return value == null ? '-' : `${Number(value).toFixed(1)} kg`
}

</script>

<template>
  <section class="bt-progress-page">
    <header class="bt-patient-heading">
      <div><h1>Mi progreso</h1><p class="text-muted">Resumen semanal</p></div>
    </header>
    <section v-if="!planStore.hasActivePlan" class="bt-lock-card">
      <div><p class="microcopy">Seguimiento bloqueado</p><h2>Aun no tienes un plan nutricional activo</h2><p class="text-muted">Cuando tu plan se active, podras actualizar tu peso y revisar tu avance nutricional.</p></div>
      <Button label="Ir a Plan Nutricional" @click="router.push('/nutritional-plan')" />
    </section>
    <template v-else>
      <section class="bt-progress-summary-grid">
        <article class="bt-patient-card"><span>Peso inicial</span><strong>{{ formatKg(progressStore.initialWeight) }}</strong></article>
        <article class="bt-patient-card"><span>Peso actual</span><strong>{{ formatKg(progressStore.currentWeight) }}</strong></article>
        <article class="bt-patient-card"><span>Peso objetivo</span><strong>{{ formatKg(progressStore.targetWeight) }}</strong></article>
        <article class="bt-patient-card"><span>IMC actual</span><strong>{{ progressStore.currentBMI == null ? '-' : progressStore.currentBMI.toFixed(1) }}</strong></article>
        <article class="bt-patient-card"><span>Clasificacion IMC</span><strong>{{ progressStore.bmiStatus }}</strong></article>
        <article class="bt-patient-card"><span>Diferencia hacia meta</span><strong>{{ formatKg(progressStore.remainingToGoal) }}</strong></article>
        <article class="bt-patient-card bt-patient-card--blue"><span>Adherencia semanal</span><strong>{{ progressStore.weeklyAdherencePercentage.toFixed(0) }}%</strong><ProgressBar :value="progressStore.weeklyAdherencePercentage" /></article>
        <article class="bt-patient-card"><span>Dias registrados</span><strong>{{ progressStore.registeredDaysCount }}</strong></article>
      </section>
      <section class="bt-progress-grid">
        <article class="bt-dashboard-panel bt-progress-placeholder"><h3>Grafico de progreso proximamente</h3><p class="text-muted">Por ahora mostramos un resumen textual semanal para validar el flujo.</p></article>
        <article class="bt-dashboard-panel">
          <h3>Acciones</h3>
          <div class="bt-inline-actions">
            <Button label="Actualizar peso" outlined @click="router.push('/progress-tracking/weight')" />
            <Button label="Ver consumo diario" outlined @click="router.push('/food-log')" />
          </div>
        </article>
      </section>
    </template>
  </section>
</template>
