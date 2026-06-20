<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import ProgressBar from 'primevue/progressbar'
import { usePatientPlanStore } from '../../../nutritional-planning/application/patient-plan.store'
import { usePatientProgressStore } from '../../application/patient-progress.store'
import WeightLineChart from '../components/weight-line-chart.vue'
import WeeklyBarsChart from '../components/weekly-bars-chart.vue'

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

const weightSeries = computed(() => {
  const byDate = new Map()
  progressStore.weightRecords.forEach((r) => {
    if (!byDate.has(r.date)) byDate.set(r.date, r)
  })
  return Array.from(byDate.values())
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((r) => Number(r.weightKg))
    .filter((v) => Number.isFinite(v))
})

const weightChartBounds = computed(() => {
  if (!weightSeries.value.length) return { yMin: 50, yMax: 100 }
  const min = Math.min(...weightSeries.value)
  const max = Math.max(...weightSeries.value)
  if (min === max) return { yMin: min - 3, yMax: max + 3 }
  return { yMin: Math.floor(min - 1), yMax: Math.ceil(max + 1) }
})

const weightAxisLabels = computed(() => {
  const { yMin, yMax } = weightChartBounds.value
  const mid = ((yMin + yMax) / 2).toFixed(1)
  return [`${yMax} kg`, `${mid} kg`, `${yMin} kg`]
})

const DAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

const weekActiveFlags = computed(() => {
  const now = new Date()
  const day = now.getDay()
  const mondayOffset = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + mondayOffset)
  monday.setHours(0, 0, 0, 0)

  const loggedDates = new Set(progressStore.foodLogs.map((l) => l.date))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return loggedDates.has(d.toISOString().slice(0, 10))
  })
})

const activeDaysCount = computed(() => weekActiveFlags.value.filter(Boolean).length)
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
        <article class="bt-patient-card bt-patient-card--blue"><span>Adherencia semanal</span><strong>{{ progressStore.weeklyAdherencePercentage.toFixed(0) }}%</strong><ProgressBar :value="Math.round(progressStore.weeklyAdherencePercentage)" /></article>
        <article class="bt-patient-card"><span>Dias registrados</span><strong>{{ progressStore.registeredDaysCount }}</strong></article>
      </section>
      <section class="bt-progress-grid">
        <article class="bt-dashboard-panel bt-progress-charts pt-scope">

          <!-- Evolución de peso -->
          <div class="prog-chart-header">
            <div>
              <h3 class="prog-chart-title">Evolución de peso</h3>
              <p class="prog-chart-sub">Últimos registros</p>
            </div>
            <span class="prog-badge">{{ formatKg(progressStore.currentWeight) }}</span>
          </div>
          <template v-if="weightSeries.length >= 2">
            <WeightLineChart
              :weights="weightSeries"
              :y-min="weightChartBounds.yMin"
              :y-max="weightChartBounds.yMax"
              :axis-tick-labels="weightAxisLabels"
            />
          </template>
          <p v-else class="prog-empty-hint">Registra tu peso al menos 2 veces para ver la evolución.</p>

          <!-- Adherencia semanal -->
          <div class="prog-chart-header" style="margin-top: 1.5rem">
            <div>
              <h3 class="prog-chart-title">Adherencia semanal</h3>
              <p class="prog-chart-sub">{{ activeDaysCount }} de 7 días registrados</p>
            </div>
            <span class="prog-badge prog-badge--green">{{ progressStore.weeklyAdherencePercentage.toFixed(0) }}%</span>
          </div>
          <WeeklyBarsChart :labels="DAY_LABELS" :active-flags="weekActiveFlags" />

        </article>
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

<style>
@import '../styles/progress-tracking.css';
</style>

<style scoped>
.prog-chart-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.prog-chart-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.prog-chart-sub {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0.125rem 0 0;
}

.prog-badge {
  background: #e8f0f9;
  color: #0f4c81;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.625rem;
  border-radius: 50rem;
  white-space: nowrap;
}

.prog-badge--green {
  background: #d1fae5;
  color: #065f46;
}

.prog-empty-hint {
  font-size: 0.8125rem;
  color: #9ca3af;
  text-align: center;
  padding: 1.5rem 0;
}

/* Override inactive bars to light green */
:deep(.pt-week-pill__bar) {
  background: #d1fae5;
}

:deep(.pt-week-pill__bar--on) {
  background: #10b981;
}

/* Weight line chart green accent */
:deep(.pt-line-chart path) {
  stroke: #10b981;
}

:deep(.pt-line-chart circle) {
  fill: #10b981;
  stroke: #ffffff;
  stroke-width: 2;
}

:deep(.pt-line-chart .pt-line-chart__grid line) {
  stroke: #e5e7eb;
  stroke-dasharray: 4 3;
}
</style>
