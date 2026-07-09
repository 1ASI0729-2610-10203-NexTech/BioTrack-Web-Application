<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useNutritionistStore } from '../../application/nutritionist.store'
import { apiService } from '../../../shared/infrastructure/api.service'

const { t } = useI18n()
const nutritionistStore = useNutritionistStore()

const consultationCount = ref(0)

const patients = computed(() => nutritionistStore.assignedPatients)

const totalPatients = computed(() => patients.value.length)

const avgAdherence = computed(() => {
  if (!patients.value.length) return 0
  const sum = patients.value.reduce((acc, p) => acc + (p.adherence?.percentage ?? 0), 0)
  return Math.round(sum / patients.value.length)
})

const activePlans = computed(() =>
  patients.value.filter((p) => p.planStatus === 'ACTIVATED').length,
)

function adherenceSeverity(pct) {
  if (pct < 50) return 'low'
  if (pct < 80) return 'medium'
  return 'good'
}

function planLabel(status) {
  if (status === 'ACTIVATED') return t('reports.planActive')
  if (status === 'DRAFT') return t('reports.planDraft')
  return t('reports.planNone')
}

onMounted(async () => {
  await nutritionistStore.fetchAssignedPatients()
  try {
    const data = await apiService.get('/consultations')
    consultationCount.value = data.consultations?.length ?? 0
  } catch {
    consultationCount.value = 0
  }
})
</script>

<template>
  <section class="bt-patient-page">
    <header class="bt-patient-heading">
      <div>
        <p class="microcopy">{{ t('reports.eyebrow') }}</p>
        <h1>{{ t('reports.title') }}</h1>
        <p class="text-muted">{{ t('reports.subtitle') }}</p>
      </div>
    </header>

    <!-- KPI Cards -->
    <div class="bt-reports-kpis">
      <div class="bt-dashboard-panel bt-reports-kpi">
        <p class="bt-reports-kpi__label">{{ t('reports.totalPatients') }}</p>
        <strong class="bt-reports-kpi__value">{{ totalPatients }}</strong>
      </div>
      <div class="bt-dashboard-panel bt-reports-kpi">
        <p class="bt-reports-kpi__label">{{ t('reports.avgAdherence') }}</p>
        <strong
          class="bt-reports-kpi__value"
          :class="`bt-reports-kpi__value--${adherenceSeverity(avgAdherence)}`"
        >{{ avgAdherence }}%</strong>
      </div>
      <div class="bt-dashboard-panel bt-reports-kpi">
        <p class="bt-reports-kpi__label">{{ t('reports.activePlans') }}</p>
        <strong class="bt-reports-kpi__value bt-reports-kpi__value--good">{{ activePlans }}</strong>
      </div>
      <div class="bt-dashboard-panel bt-reports-kpi">
        <p class="bt-reports-kpi__label">{{ t('reports.totalConsultations') }}</p>
        <strong class="bt-reports-kpi__value">{{ consultationCount }}</strong>
      </div>
    </div>

    <!-- Patient Table -->
    <div class="bt-dashboard-panel">
      <h3 class="bt-reports-table-title">{{ t('reports.patientTable') }}</h3>

      <p v-if="!patients.length" class="text-muted">{{ t('reports.noPatients') }}</p>

      <div v-else class="bt-reports-table-wrap">
        <table class="bt-reports-table">
          <thead>
            <tr>
              <th>{{ t('reports.name') }}</th>
              <th>{{ t('reports.adherence') }}</th>
              <th>{{ t('reports.caloriesConsumed') }}</th>
              <th>{{ t('reports.caloriesTarget') }}</th>
              <th>{{ t('reports.bmi') }}</th>
              <th>{{ t('reports.planStatus') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in patients" :key="p.id">
              <td class="bt-reports-table__name">{{ p.name }}</td>
              <td>
                <div class="bt-reports-adherence">
                  <div class="bt-reports-bar-wrap">
                    <div
                      class="bt-reports-bar"
                      :class="`bt-reports-bar--${adherenceSeverity(p.adherence?.percentage ?? 0)}`"
                      :style="{ width: (p.adherence?.percentage ?? 0) + '%' }"
                    />
                  </div>
                  <span
                    class="bt-reports-pct"
                    :class="`bt-reports-pct--${adherenceSeverity(p.adherence?.percentage ?? 0)}`"
                  >{{ p.adherence?.percentage ?? 0 }}%</span>
                </div>
              </td>
              <td>{{ p.adherence?.consumed ?? 0 }}</td>
              <td>{{ p.adherence?.target ?? 0 }}</td>
              <td>{{ p.bmi ?? '—' }}</td>
              <td>
                <span
                  class="bt-reports-status"
                  :class="p.planStatus === 'ACTIVATED' ? 'bt-reports-status--active' : 'bt-reports-status--draft'"
                >{{ planLabel(p.planStatus) }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<style scoped>
.bt-reports-kpis {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.bt-reports-kpi {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.bt-reports-kpi__label {
  font-size: 0.8rem;
  color: var(--bt-text-muted);
  margin: 0;
}
.bt-reports-kpi__value {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
  color: var(--bt-text);
}
.bt-reports-kpi__value--good { color: var(--bt-success); }
.bt-reports-kpi__value--medium { color: #f59e0b; }
.bt-reports-kpi__value--low { color: var(--bt-danger, #e53935); }

.bt-reports-table-title {
  font-size: 1rem;
  margin-bottom: 1rem;
}
.bt-reports-table-wrap {
  overflow-x: auto;
}
.bt-reports-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}
.bt-reports-table th {
  text-align: left;
  padding: 0.5rem 0.75rem;
  border-bottom: 2px solid var(--bt-border, #e5e7eb);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--bt-text-muted);
  white-space: nowrap;
}
.bt-reports-table td {
  padding: 0.75rem;
  border-bottom: 1px solid var(--bt-border, #e5e7eb);
  vertical-align: middle;
}
.bt-reports-table__name { font-weight: 600; }

.bt-reports-adherence {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 110px;
}
.bt-reports-bar-wrap {
  flex: 1;
  height: 6px;
  background: var(--bt-border, #e5e7eb);
  border-radius: 3px;
  overflow: hidden;
}
.bt-reports-bar {
  height: 100%;
  border-radius: 3px;
  transition: width 0.4s ease;
}
.bt-reports-bar--good { background: var(--bt-success); }
.bt-reports-bar--medium { background: #f59e0b; }
.bt-reports-bar--low { background: var(--bt-danger, #e53935); }
.bt-reports-pct { font-size: 0.8rem; font-weight: 600; white-space: nowrap; }
.bt-reports-pct--good { color: var(--bt-success); }
.bt-reports-pct--medium { color: #f59e0b; }
.bt-reports-pct--low { color: var(--bt-danger, #e53935); }

.bt-reports-status {
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.bt-reports-status--active { background: #d1fae5; color: #065f46; }
.bt-reports-status--draft { background: #f3f4f6; color: #6b7280; }
</style>
