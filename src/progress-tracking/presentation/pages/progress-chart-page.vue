<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import ProgressCard from '../components/progress-card.vue'
import ProgressBar from '../components/progress-bar.vue'
import MetricCard from '../components/metric-card.vue'
import WeightLineChart from '../components/weight-line-chart.vue'
import { getProgressOverview } from '../../application/use-cases/get-progress-overview.use-case.js'

const { t } = useI18n()
const overview = ref(null)
const activeTab = ref('weight')

onMounted(async () => {
  overview.value = await getProgressOverview()
})

const lostLabel = computed(() => {
  if (!overview.value) return ''
  return t('progressTracking.progressChart.totalLost', { value: overview.value.totalLost.toFixed(1) })
})

const goalHint = computed(() => {
  if (!overview.value) return ''
  const remaining = overview.value.remainingToGoalKg.toFixed(0)
  return t('progressTracking.progressChart.remainingKg', { value: remaining })
})

const registeredHint = computed(() => {
  if (!overview.value) return ''
  return t('progressTracking.progressChart.registeredGoal', { count: overview.value.targetRegisteredDays })
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
        <p class="pt-eyebrow pt-eyebrow--navy">{{ t('progressTracking.progressChart.eyebrow') }}</p>
        <h1 class="pt-title">{{ t('progressTracking.progressChart.title') }}</h1>
        <p class="pt-subtitle">{{ t('progressTracking.progressChart.subtitle') }}</p>
      </div>
      <div class="pt-tabs" role="tablist" :aria-label="t('progressTracking.progressChart.tabsAria')">
        <button
          type="button"
          class="pt-tab"
          :class="{ 'pt-tab--active': activeTab === 'weight' }"
          role="tab"
          :aria-selected="activeTab === 'weight'"
          @click="activeTab = 'weight'"
        >
          {{ t('progressTracking.progressChart.weightTab') }}
        </button>
        <button
          type="button"
          class="pt-tab"
          :class="{ 'pt-tab--active': activeTab === 'adherence' }"
          role="tab"
          :aria-selected="activeTab === 'adherence'"
          @click="activeTab = 'adherence'"
        >
          {{ t('progressTracking.progressChart.adherenceTab') }}
        </button>
        <button
          type="button"
          class="pt-tab"
          :class="{ 'pt-tab--active': activeTab === 'activity' }"
          role="tab"
          :aria-selected="activeTab === 'activity'"
          @click="activeTab = 'activity'"
        >
          {{ t('progressTracking.progressChart.activityTab') }}
        </button>
      </div>
    </header>

    <div v-if="activeTab === 'weight'" class="pt-grid-12">
      <div class="pt-span-8">
        <ProgressCard :title="t('progressTracking.progressChart.weightEvolutionTitle')">
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
          :label="t('progressTracking.progressChart.initialWeight')"
          :value="`${overview.initialWeight.toFixed(1)} kg`"
        />
        <MetricCard
          variant="blue"
          :label="t('progressTracking.progressChart.currentWeight')"
          :value="`${overview.currentWeight.toFixed(1)} kg`"
          :badge="lostLabel"
        />
        <MetricCard
          :label="t('progressTracking.progressChart.goal')"
          :value="`${overview.goalWeight.toFixed(1)} kg`"
          value-tone="green"
          :hint="goalHint"
        />

        <div class="pt-metric-grid">
          <MetricCard :label="t('progressTracking.progressChart.averageAdherence')" :value="`${overview.averageAdherence}%`">
            <ProgressBar :value="overview.averageAdherence" :on-surface="true" class="pt-gap" />
          </MetricCard>
          <MetricCard
            :label="t('progressTracking.progressChart.weeklyActivity')"
            :value="activeDaysLabel"
            :hint="t('progressTracking.progressChart.activeDays')"
          />
          <MetricCard
            :label="t('progressTracking.progressChart.registeredDays')"
            :value="String(overview.registeredDays)"
            :hint="registeredHint"
          />
          <MetricCard :label="t('progressTracking.progressChart.activeWeeks')" :value="String(overview.activeWeeks)">
            <ProgressBar variant="blue" :value="weeksProgress" :on-surface="true" class="pt-gap" />
          </MetricCard>
        </div>
      </div>
    </div>

    <ProgressCard v-else-if="activeTab === 'adherence'" :title="t('progressTracking.progressChart.adherenceTitle')">
      <p class="pt-subtitle">
        {{ t('progressTracking.progressChart.adherenceDetail') }}
        <RouterLink to="/progress-tracking/adherence-plan">{{ t('progressTracking.progressChart.adherenceLink') }}</RouterLink>
        .
      </p>
    </ProgressCard>

    <ProgressCard v-else :title="t('progressTracking.progressChart.activityTitle')">
      <p class="pt-subtitle">
        {{ t('progressTracking.progressChart.activityDetailStart') }}
        <RouterLink to="/progress-tracking/activity-record">{{ t('progressTracking.progressChart.activityLink') }}</RouterLink>
        {{ t('progressTracking.progressChart.activityDetailEnd') }}
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
