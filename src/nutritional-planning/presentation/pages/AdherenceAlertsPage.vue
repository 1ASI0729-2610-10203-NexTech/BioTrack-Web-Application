<script setup>
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import { useNutritionistStore } from '../../application/nutritionist.store'

const { t } = useI18n()
const router = useRouter()
const nutritionistStore = useNutritionistStore()

const patients = computed(() => nutritionistStore.assignedPatients)

const sorted = computed(() =>
  [...patients.value].sort((a, b) => (a.adherence?.percentage ?? 0) - (b.adherence?.percentage ?? 0)),
)

const alerts = computed(() => sorted.value.filter((p) => (p.adherence?.percentage ?? 0) < 80))
const good = computed(() => sorted.value.filter((p) => (p.adherence?.percentage ?? 0) >= 80))

function severity(pct) {
  if (pct < 50) return 'low'
  if (pct < 80) return 'medium'
  return 'good'
}

function badgeLabel(pct) {
  if (pct < 50) return t('adherenceAlerts.lowBadge')
  if (pct < 80) return t('adherenceAlerts.mediumBadge')
  return t('adherenceAlerts.goodBadge')
}

onMounted(() => nutritionistStore.fetchAssignedPatients())
</script>

<template>
  <section class="bt-patient-page">
    <header class="bt-patient-heading">
      <div>
        <p class="microcopy">{{ t('adherenceAlerts.eyebrow') }}</p>
        <h1>{{ t('adherenceAlerts.title') }}</h1>
        <p class="text-muted">{{ t('adherenceAlerts.subtitle') }}</p>
      </div>
    </header>

    <div v-if="alerts.length === 0 && good.length > 0" class="bt-dashboard-panel bt-adherence-all-good">
      <i class="pi pi-check-circle bt-adherence-check" aria-hidden="true" />
      <p>{{ t('adherenceAlerts.allGood') }}</p>
    </div>

    <div v-if="alerts.length" class="bt-list-stack">
      <div
        v-for="patient in alerts"
        :key="patient.id"
        class="bt-dashboard-panel bt-adherence-card"
        :class="`bt-adherence-card--${severity(patient.adherence?.percentage ?? 0)}`"
      >
        <div class="bt-adherence-card__header">
          <div class="bt-adherence-card__identity">
            <strong class="bt-adherence-card__name">{{ patient.name }}</strong>
            <span
              class="bt-adherence-badge"
              :class="`bt-adherence-badge--${severity(patient.adherence?.percentage ?? 0)}`"
            >
              {{ badgeLabel(patient.adherence?.percentage ?? 0) }}
            </span>
          </div>
          <div class="bt-adherence-card__pct">{{ patient.adherence?.percentage ?? 0 }}%</div>
        </div>

        <div class="bt-adherence-card__bar-wrap">
          <div
            class="bt-adherence-card__bar"
            :class="`bt-adherence-card__bar--${severity(patient.adherence?.percentage ?? 0)}`"
            :style="{ width: (patient.adherence?.percentage ?? 0) + '%' }"
          />
        </div>

        <div class="bt-adherence-card__stats">
          <span>{{ t('adherenceAlerts.consumed') }}: <strong>{{ patient.adherence?.consumed ?? 0 }} kcal</strong></span>
          <span>{{ t('adherenceAlerts.target') }}: <strong>{{ patient.adherence?.target ?? 0 }} kcal</strong></span>
          <span v-if="patient.planStatus === 'ACTIVATED'">{{ t('nutritionist.patientDetail.planActive') }}</span>
        </div>

        <Button
          :label="t('adherenceAlerts.viewDetail')"
          severity="secondary"
          size="small"
          outlined
          @click="router.push(`/nutritionist-patients/${patient.id}`)"
        />
      </div>
    </div>

    <div v-if="good.length && alerts.length" class="bt-adherence-good-section">
      <h3 class="bt-adherence-good-title">{{ t('adherenceAlerts.goodBadge') }}</h3>
      <div class="bt-list-stack">
        <div
          v-for="patient in good"
          :key="patient.id"
          class="bt-dashboard-panel bt-adherence-card bt-adherence-card--good"
        >
          <div class="bt-adherence-card__header">
            <div class="bt-adherence-card__identity">
              <strong class="bt-adherence-card__name">{{ patient.name }}</strong>
              <span class="bt-adherence-badge bt-adherence-badge--good">{{ t('adherenceAlerts.goodBadge') }}</span>
            </div>
            <div class="bt-adherence-card__pct">{{ patient.adherence?.percentage ?? 0 }}%</div>
          </div>
          <div class="bt-adherence-card__bar-wrap">
            <div
              class="bt-adherence-card__bar bt-adherence-card__bar--good"
              :style="{ width: (patient.adherence?.percentage ?? 0) + '%' }"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.bt-adherence-all-good {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--bt-success);
  font-weight: 600;
}
.bt-adherence-check {
  font-size: 1.5rem;
}
.bt-adherence-card {
  display: grid;
  gap: 0.75rem;
  border-left: 4px solid transparent;
}
.bt-adherence-card--low { border-left-color: var(--bt-danger, #e53935); }
.bt-adherence-card--medium { border-left-color: #f59e0b; }
.bt-adherence-card--good { border-left-color: var(--bt-success); }

.bt-adherence-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.bt-adherence-card__identity {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.bt-adherence-card__name { font-size: 1rem; }
.bt-adherence-card__pct {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--bt-text);
}

.bt-adherence-card__bar-wrap {
  height: 6px;
  background: var(--bt-border, #e5e7eb);
  border-radius: 3px;
  overflow: hidden;
}
.bt-adherence-card__bar {
  height: 100%;
  border-radius: 3px;
  transition: width 0.4s ease;
}
.bt-adherence-card__bar--low { background: var(--bt-danger, #e53935); }
.bt-adherence-card__bar--medium { background: #f59e0b; }
.bt-adherence-card__bar--good { background: var(--bt-success); }

.bt-adherence-card__stats {
  display: flex;
  gap: 1.25rem;
  font-size: 0.875rem;
  color: var(--bt-text-muted);
  flex-wrap: wrap;
}

.bt-adherence-badge {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.bt-adherence-badge--low { background: #fee2e2; color: #b91c1c; }
.bt-adherence-badge--medium { background: #fef3c7; color: #92400e; }
.bt-adherence-badge--good { background: #d1fae5; color: #065f46; }

.bt-adherence-good-section { margin-top: 2rem; }
.bt-adherence-good-title {
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--bt-text-muted);
  margin-bottom: 0.75rem;
}
</style>
