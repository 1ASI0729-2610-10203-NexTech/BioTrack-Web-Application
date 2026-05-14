<script setup>
import { computed, onMounted, ref } from 'vue'
import ProgressCard from '../components/progress-card.vue'
import ProgressBar from '../components/progress-bar.vue'
import MetricCard from '../components/metric-card.vue'
import WeightLineChart from '../components/weight-line-chart.vue'
import { getProgressOverview } from '../../application/use-cases/get-progress-overview.use-case.js'

const overview = ref(null)
const activeTab = ref('weight')

onMounted(async () => {
  overview.value = await getProgressOverview()
})

const lostLabel = computed(() => {
  if (!overview.value) return ''
  return `↓ ${overview.value.totalLost.toFixed(1)} kg total`
})

const goalHint = computed(() => {
  if (!overview.value) return ''
  const remaining = overview.value.remainingToGoalKg.toFixed(0)
  return `Faltan ${remaining} kg`
})

const registeredHint = computed(() => {
  if (!overview.value) return ''
  return `de ${overview.value.targetRegisteredDays} objetivo`
})

const activeDaysLabel = computed(() => {
  if (!overview.value) return ''
  return `${overview.value.activeDays}/${overview.value.targetActiveDays}`
})

const weeksProgress = computed(() => {
  if (!overview.value) return 0
  return Math.min(100, Math.round((overview.value.activeWeeks / 12) * 100))
})
</script>

<template>
  <div v-if="overview">
    <header class="pt-page-header">
      <div>
        <p class="pt-eyebrow pt-eyebrow--navy">Mi progreso</p>
        <h1 class="pt-title">Gráfico de progreso</h1>
        <p class="pt-subtitle">Evolución de tus medidas y metas nutricionales</p>
      </div>
      <div class="pt-tabs" role="tablist" aria-label="Vistas de progreso">
        <button
          type="button"
          class="pt-tab"
          :class="{ 'pt-tab--active': activeTab === 'weight' }"
          role="tab"
          :aria-selected="activeTab === 'weight'"
          @click="activeTab = 'weight'"
        >
          Peso
        </button>
        <button
          type="button"
          class="pt-tab"
          :class="{ 'pt-tab--active': activeTab === 'adherence' }"
          role="tab"
          :aria-selected="activeTab === 'adherence'"
          @click="activeTab = 'adherence'"
        >
          Adherencia
        </button>
        <button
          type="button"
          class="pt-tab"
          :class="{ 'pt-tab--active': activeTab === 'activity' }"
          role="tab"
          :aria-selected="activeTab === 'activity'"
          @click="activeTab = 'activity'"
        >
          Actividad
        </button>
      </div>
    </header>

    <div v-if="activeTab === 'weight'" class="pt-grid-12">
      <div class="pt-span-8">
        <ProgressCard title="Evolución de peso — últimas 8 semanas">
          <div class="pt-row pt-row--tight">
            <span class="pt-badge pt-badge--success">{{ lostLabel }}</span>
          </div>
          <WeightLineChart
            :weights="overview.weeklyWeights"
            :y-min="76"
            :y-max="82"
            :axis-tick-labels="['80 kg', '78 kg', '76 kg']"
          />
        </ProgressCard>
      </div>
      <div class="pt-span-4 pt-stack">
        <MetricCard
          label="Peso inicial"
          :value="`${overview.initialWeight.toFixed(1)} kg`"
        />
        <MetricCard
          variant="blue"
          label="Peso actual"
          :value="`${overview.currentWeight.toFixed(1)} kg`"
          :badge="lostLabel"
        />
        <MetricCard
          label="Meta"
          :value="`${overview.goalWeight.toFixed(1)} kg`"
          value-tone="green"
          :hint="goalHint"
        />

        <div class="pt-metric-grid">
          <MetricCard label="Adherencia promedio" :value="`${overview.averageAdherence}%`">
            <ProgressBar :value="overview.averageAdherence" :on-surface="true" class="pt-gap" />
          </MetricCard>
          <MetricCard
            label="Actividad semanal"
            :value="activeDaysLabel"
            hint="días activos"
          />
          <MetricCard
            label="Días registrados"
            :value="String(overview.registeredDays)"
            :hint="registeredHint"
          />
          <MetricCard label="Semanas activo" :value="String(overview.activeWeeks)">
            <ProgressBar variant="blue" :value="weeksProgress" :on-surface="true" class="pt-gap" />
          </MetricCard>
        </div>
      </div>
    </div>

    <ProgressCard v-else-if="activeTab === 'adherence'" title="Adherencia">
      <p class="pt-subtitle">
        Visualiza el detalle semanal en la pantalla
        <RouterLink to="/progress-tracking/adherence-plan">Adherencia al plan</RouterLink>
        .
      </p>
    </ProgressCard>

    <ProgressCard v-else title="Actividad">
      <p class="pt-subtitle">
        Registra tu actividad física en
        <RouterLink to="/progress-tracking/activity-record">Registro de actividad</RouterLink>
        para considerar el gasto calórico en tu adherencia.
      </p>
    </ProgressCard>
  </div>
</template>

<style scoped>
.pt-row--tight {
  margin-bottom: 1rem;
}

.pt-stack {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.pt-gap {
  margin-top: 0.75rem;
}
</style>
