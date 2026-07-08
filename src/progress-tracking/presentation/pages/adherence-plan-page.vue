<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import ProgressCard from '../components/progress-card.vue'
import MetricCard from '../components/metric-card.vue'
import { getAdherenceSummary } from '../../application/use-cases/get-adherence-summary.use-case.js'

const { t } = useI18n()
const summary = ref(null)

onMounted(async () => {
  summary.value = await getAdherenceSummary()
})

const alertLabel = computed(() => (summary.value?.nutritionistAlertSent ? t('common.sent') : t('common.notSent')))
</script>

<template>
  <div v-if="summary">
    <header class="pt-page-header">
      <div>
        <p class="pt-eyebrow">{{ t('progressTracking.adherencePlan.eyebrow') }}</p>
        <h1 class="pt-title">{{ t('progressTracking.adherencePlan.title') }}</h1>
        <p class="pt-subtitle">{{ summary.weekLabel }}</p>
      </div>
      <span class="pt-badge pt-badge--soft-blue pt-badge--circle" :aria-label="t('progressTracking.adherencePlan.calculatedAria')">
        {{ t('progressTracking.adherencePlan.calculatedBadge') }}
      </span>
    </header>

    <div class="pt-metric-grid pt-four-cols">
      <MetricCard
        variant="blue"
        :label="t('progressTracking.adherencePlan.weeklyAdherence')"
        :value="`${summary.weeklyAdherence}%`"
        :hint="t('progressTracking.adherencePlan.goodCompliance')"
      />
      <MetricCard
        :label="t('progressTracking.adherencePlan.registeredDays')"
        :value="`${summary.registeredDays}/${summary.totalDays}`"
      />
      <MetricCard
        :label="t('progressTracking.adherencePlan.mealsAccordingToPlan')"
        :value="`${summary.mealsAccordingToPlan}%`"
        value-tone="green"
      />
      <MetricCard
        :label="t('progressTracking.adherencePlan.nutritionistAlert')"
        :value="alertLabel"
        :value-tone="summary.nutritionistAlertSent ? 'default' : 'green'"
      />
    </div>

    <ProgressCard class="pt-detail-card" :title="t('progressTracking.adherencePlan.detailByDay')">
      <div class="pt-day-bars" role="list">
        <div v-for="row in summary.dayDetails" :key="row.day" class="pt-day-bar" role="listitem">
          <div
            class="pt-day-bar__col"
            :aria-label="t('progressTracking.adherencePlan.dayAdherenceAria', { day: row.day, percent: row.percent })"
          >
            <div
              v-if="row.percent === 0"
              class="pt-day-bar__fill pt-day-bar__fill--muted pt-day-bar__fill--empty"
            />
            <div v-else class="pt-day-bar__fill" :style="{ height: `${Math.min(row.percent, 100)}%` }" />
          </div>
          <div>{{ row.day }}</div>
          <div class="pt-day-pct">{{ row.percent }}%</div>
        </div>
      </div>
    </ProgressCard>
  </div>
</template>

<style scoped>
.pt-four-cols {
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-bottom: 1.25rem;
}

.pt-detail-card {
  margin-top: 0.5rem;
}

.pt-day-bar__fill--empty {
  height: 0.25rem;
  width: 100%;
  border-radius: 0.25rem;
}

@media (max-width: 64rem) {
  .pt-four-cols {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 40rem) {
  .pt-four-cols {
    grid-template-columns: 1fr;
  }
}
</style>
