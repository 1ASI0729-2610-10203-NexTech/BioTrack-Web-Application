<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import ProgressCard from '../components/progress-card.vue'
import ProgressAlert from '../components/progress-alert.vue'
import { loadWeeklyWeightSnapshot, updateWeeklyWeight } from '../../application/use-cases/update-weekly-weight.use-case.js'

const { t } = useI18n()
const snapshot = ref(null)
const weightInput = ref('')

onMounted(async () => {
  snapshot.value = await loadWeeklyWeightSnapshot()
  weightInput.value = snapshot.value.currentWeight.toFixed(1)
})

const variationLabel = computed(() => {
  if (!snapshot.value) return ''
  const value = snapshot.value.variation
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(1)} kg`
})

const goalLine = computed(() => {
  if (!snapshot.value) return ''
  return t('progressTracking.weeklyWeight.goalLine', {
    goal: snapshot.value.goalWeight,
    remaining: snapshot.value.remainingToGoalKg.toFixed(0),
  })
})

async function handleSave() {
  const next = Number(weightInput.value)
  if (!Number.isFinite(next)) return
  snapshot.value = await updateWeeklyWeight({ weightKg: next })
  weightInput.value = snapshot.value.currentWeight.toFixed(1)
}
</script>

<template>
  <div v-if="snapshot">
    <header class="pt-page-header">
      <div>
        <p class="pt-eyebrow pt-eyebrow--accent">{{ t('progressTracking.weeklyWeight.eyebrow') }}</p>
        <h1 class="pt-title">{{ t('progressTracking.weeklyWeight.title') }}</h1>
        <p class="pt-subtitle">{{ snapshot.weekLabel }}</p>
      </div>
      <span class="pt-badge pt-badge--success pt-badge--circle">{{ t('progressTracking.weeklyWeight.updatedBadge') }}</span>
    </header>

    <ProgressAlert :message="t('progressTracking.weeklyWeight.updatedMessage')" class="pt-alert-space" />

    <div class="pt-grid-12">
      <div class="pt-span-6">
        <ProgressCard>
          <label class="pt-form-label" for="current-weight-input">{{ t('progressTracking.weeklyWeight.currentWeightKg') }}</label>
          <div class="pt-input-wrap">
            <input
              id="current-weight-input"
              v-model="weightInput"
              class="pt-input"
              type="number"
              step="0.1"
              min="30"
              max="250"
              autocomplete="off"
            />
            <span class="pt-input-suffix" aria-hidden="true">kg</span>
          </div>

          <div class="pt-mini-grid">
            <div class="pt-muted-box">
              <p class="pt-metric-label">{{ t('progressTracking.weeklyWeight.previousWeight') }}</p>
              <p class="pt-metric-value pt-metric-value--blue">{{ snapshot.previousWeight.toFixed(1) }} kg</p>
            </div>
            <div class="pt-surface-emerald">
              <p class="pt-metric-label">{{ t('progressTracking.weeklyWeight.variation') }}</p>
              <p class="pt-metric-value">{{ variationLabel }}</p>
            </div>
          </div>

          <div class="pt-muted-box pt-bmi-row">
            <div class="pt-bmi-row__inner">
              <p class="pt-metric-label">{{ t('progressTracking.weeklyWeight.bmi') }}</p>
              <p class="pt-metric-value pt-metric-value--green">{{ snapshot.bmi.toFixed(1) }}</p>
            </div>
          </div>

          <button type="button" class="pt-btn pt-btn--primary pt-save-btn" :aria-label="t('progressTracking.weeklyWeight.saveWeight')" @click="handleSave">
            {{ t('progressTracking.weeklyWeight.saveWeight') }}
          </button>
        </ProgressCard>
      </div>

      <div class="pt-span-6 pt-stack">
        <div class="pt-panel-blue">
          <p class="pt-panel-blue__label">{{ t('progressTracking.weeklyWeight.currentWeight') }}</p>
          <p class="pt-panel-blue__value">{{ snapshot.currentWeight.toFixed(1) }} kg</p>
          <p class="pt-panel-blue__hint">{{ goalLine }}</p>
        </div>

        <ProgressCard :title="t('progressTracking.weeklyWeight.lastWeeks')">
          <ul class="pt-week-list">
            <li
              v-for="row in snapshot.latestWeeks"
              :key="row.id"
              class="pt-week-list__item"
              :class="{ 'pt-week-list__item--hot': row.highlight }"
            >
              <span>{{ row.label }}</span>
              <span>{{ row.weightKg.toFixed(1) }} kg</span>
              <span v-if="row.highlight" class="pt-week-arrow" aria-hidden="true">↓</span>
            </li>
          </ul>
        </ProgressCard>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pt-alert-space {
  margin-bottom: 1rem;
}

.pt-mini-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  margin-top: 1rem;
}

.pt-bmi-row {
  margin-top: 1rem;
}

.pt-bmi-row__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.pt-save-btn {
  margin-top: 1.25rem;
  width: 100%;
}

.pt-stack {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.pt-week-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.pt-week-list__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.625rem 0;
  border-bottom: 0.0625rem solid var(--pt-border, #e5e7eb);
  font-weight: 600;
}

.pt-week-list__item--hot {
  color: var(--pt-green, #10b981);
}

.pt-week-arrow {
  font-size: 1rem;
}
</style>
