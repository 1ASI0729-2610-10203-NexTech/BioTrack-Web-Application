<script setup>
import { onMounted, ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import ProgressCard from '../components/progress-card.vue'
import ProgressBar from '../components/progress-bar.vue'
import ProgressAlert from '../components/progress-alert.vue'
import FoodEntryList from '../components/food-entry-list.vue'
import WeeklyBarsChart from '../components/weekly-bars-chart.vue'
import { getConsumptionSummary } from '../../application/use-cases/get-consumption-summary.use-case.js'

const toast = useToast()

const summary = ref(null)
const calorieProgress = ref(0)
const formattedDate = ref('')
const formattedConsumed = ref('')
const formattedTarget = ref('')

onMounted(async () => {
  const payload = await getConsumptionSummary()
  summary.value = payload.record
  calorieProgress.value = payload.calorieProgress
  formattedDate.value = payload.formattedDate
  formattedConsumed.value = payload.formattedConsumed
  formattedTarget.value = payload.formattedTarget
})

function handleAddFood() {
  toast.add({
    severity: 'info',
    summary: 'Agregar alimento',
    detail: 'Flujo de registro disponible próximamente.',
    life: 2500,
  })
}
</script>

<template>
  <div v-if="summary">
    <header class="pt-page-header">
      <div>
        <p class="pt-eyebrow pt-eyebrow--accent">Seguimiento diario</p>
        <h1 class="pt-title">Registro de consumo</h1>
        <p class="pt-subtitle">{{ formattedDate }}</p>
      </div>
      <span class="pt-badge pt-badge--success">✓ Guardado</span>
    </header>

    <div class="pt-grid-12">
      <div class="pt-span-7">
        <ProgressCard title="Alimentos registrados hoy">
          <template #actions>
            <button
              type="button"
              class="pt-btn pt-btn--outline-green"
              aria-label="Agregar alimento al día"
              @click="handleAddFood"
            >
              + Agregar alimento
            </button>
          </template>
          <FoodEntryList :entries="summary.meals" />
        </ProgressCard>
      </div>

      <div class="pt-span-5 pt-stack">
        <div class="pt-panel-blue">
          <p class="pt-panel-blue__label">Calorías consumidas</p>
          <p class="pt-panel-blue__value">{{ formattedConsumed }}</p>
          <p class="pt-panel-blue__hint">de {{ formattedTarget }} kcal objetivo</p>
          <ProgressBar :value="calorieProgress" />
        </div>

        <ProgressCard>
          <p class="pt-metric-label">Adherencia del día</p>
          <p class="pt-metric-value pt-metric-value--green">{{ summary.dailyAdherence }}%</p>
          <p class="pt-metric-sub">Excelente cumplimiento</p>
          <ProgressBar :value="summary.dailyAdherence" :on-surface="true" />
        </ProgressCard>

        <ProgressCard title="Semana actual">
          <WeeklyBarsChart variant="blocks" :active-flags="summary.weekActivity" />
        </ProgressCard>
      </div>
    </div>

    <ProgressAlert
      class="pt-stack"
      message="✓ Consumo diario registrado exitosamente — Se actualizó tu historial y el cálculo de adherencia al plan."
    />
  </div>
</template>

<style scoped>
.pt-stack {
  margin-top: 1.25rem;
}
</style>
