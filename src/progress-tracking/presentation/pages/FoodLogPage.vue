<script setup>
import { computed, onMounted, reactive } from 'vue'
import Button from 'primevue/button'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import ProgressBar from 'primevue/progressbar'
import Select from 'primevue/select'
import { usePatientPlanStore } from '../../../nutritional-planning/application/patient-plan.store'
import { usePatientProgressStore } from '../../application/patient-progress.store'

const patientPlanStore = usePatientPlanStore()
const patientProgressStore = usePatientProgressStore()
const mealOptions = [
  { label: 'Desayuno', value: 'desayuno' },
  { label: 'Almuerzo', value: 'almuerzo' },
  { label: 'Merienda', value: 'merienda' },
  { label: 'Cena', value: 'cena' },
]
const mealIcons = { desayuno: '☀️', almuerzo: '🍽️', merienda: '🥤', cena: '🌙' }
const form = reactive({ mealType: '', description: '', calories: null })
const validation = reactive({ mealType: '', description: '', calories: '' })
const todayLabel = computed(() =>
  new Intl.DateTimeFormat('es-PE', { dateStyle: 'long' }).format(new Date()),
)

onMounted(async () => {
  const plan = await patientPlanStore.fetchPatientPlan()
  await patientProgressStore.fetchProgressData()
  patientProgressStore.setDailyTargetCalories(plan?.targetCalories ?? 1850)
  patientProgressStore.calculateDailyCalories()
  patientProgressStore.calculateDailyAdherence()
})

function validateFoodLog() {
  validation.mealType = !form.mealType ? 'Selecciona un tipo de comida.' : ''
  validation.description = !form.description.trim() ? 'Describe el alimento.' : ''
  validation.calories =
    !form.calories || Number(form.calories) <= 0 ? 'Ingresa calorias mayores a 0.' : ''
  return !validation.mealType && !validation.description && !validation.calories
}

async function submitFoodLog() {
  if (!validateFoodLog() || !patientPlanStore.hasActivePlan) return
  const saved = await patientProgressStore.addFoodLog(form)
  if (!saved) return
  form.mealType = ''
  form.description = ''
  form.calories = null
}
</script>

<template>
  <section class="bt-food-page">
    <header class="bt-patient-heading">
      <div>
        <p class="microcopy">Registro de consumo</p>
        <h1>Registro de consumo</h1>
        <p class="text-muted">{{ todayLabel }}</p>
      </div>
    </header>
    <section v-if="!patientPlanStore.hasActivePlan" class="bt-lock-card">
      <div><p class="microcopy">Seguimiento bloqueado</p><h2>Debes tener un plan nutricional activo para registrar consumo.</h2></div>
    </section>
    <template v-else>
      <section class="bt-food-summary-grid">
        <article class="bt-patient-card bt-patient-card--blue">
          <span>Calorias consumidas</span><strong>{{ patientProgressStore.dailyConsumedCalories }} kcal</strong><small>Objetivo: {{ patientProgressStore.dailyTargetCalories }} kcal</small>
        </article>
        <article class="bt-patient-card">
          <span>Adherencia del dia</span><strong>{{ patientProgressStore.dailyAdherence.value.toFixed(0) }}%</strong><ProgressBar :value="patientProgressStore.dailyAdherence.value" />
        </article>
      </section>
      <section class="bt-food-grid">
        <article class="bt-dashboard-panel">
          <h3>Agregar alimento</h3>
          <Message v-if="patientProgressStore.error" severity="error">{{ patientProgressStore.error }}</Message>
          <Message v-if="patientProgressStore.savedRecently" severity="success">Consumo guardado correctamente.</Message>
          <form class="bt-food-form" @submit.prevent="submitFoodLog">
            <label>Tipo de comida<Select v-model="form.mealType" :options="mealOptions" option-label="label" option-value="value" :invalid="Boolean(validation.mealType)" /></label>
            <p v-if="validation.mealType" class="bt-auth-helper">{{ validation.mealType }}</p>
            <label>Descripcion<InputText v-model="form.description" :invalid="Boolean(validation.description)" /></label>
            <p v-if="validation.description" class="bt-auth-helper">{{ validation.description }}</p>
            <label>Calorias<InputNumber v-model="form.calories" :min="1" :invalid="Boolean(validation.calories)" /></label>
            <p v-if="validation.calories" class="bt-auth-helper">{{ validation.calories }}</p>
            <Button label="Guardar consumo" :loading="patientProgressStore.loading" type="submit" />
          </form>
        </article>
        <article class="bt-dashboard-panel">
          <h3>Alimentos registrados hoy</h3>
          <div v-if="patientProgressStore.getTodayFoodLogs.length" class="bt-food-log-list">
            <div v-for="log in patientProgressStore.getTodayFoodLogs" :key="`${log.date}-${log.mealType}`" class="bt-meal-row">
              <span>{{ mealIcons[log.mealType] }}</span><div><strong>{{ log.description }}</strong><small>{{ log.mealType }}</small></div><em>{{ log.calories }} kcal</em>
            </div>
          </div>
          <p v-else class="text-muted">Aun no registraste alimentos hoy.</p>
        </article>
      </section>
    </template>
  </section>
</template>
