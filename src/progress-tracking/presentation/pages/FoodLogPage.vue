<script setup>
import { computed, onMounted, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import ProgressBar from 'primevue/progressbar'
import Select from 'primevue/select'
import { usePatientPlanStore } from '../../../nutritional-planning/application/patient-plan.store'
import { usePatientProgressStore } from '../../application/patient-progress.store'

const { t } = useI18n()
const patientPlanStore = usePatientPlanStore()
const patientProgressStore = usePatientProgressStore()
const mealOptions = computed(() => [
  { label: t('mealTypes.desayuno'), value: 'desayuno' },
  { label: t('mealTypes.almuerzo'), value: 'almuerzo' },
  { label: t('mealTypes.merienda'), value: 'merienda' },
  { label: t('mealTypes.cena'), value: 'cena' },
])
const mealIcons = { desayuno: '☀️', almuerzo: '🍽️', merienda: '🥤', cena: '🌙' }
const form = reactive({ mealType: '', description: '', calories: null })
const validation = reactive({ mealType: '', description: '', calories: '' })
const todayLabel = computed(() =>
  new Intl.DateTimeFormat('es-PE', { dateStyle: 'long' }).format(new Date()),
)

onMounted(async () => {
  const plan = await patientPlanStore.fetchPatientPlan()
  await patientProgressStore.fetchProgressData()
  patientProgressStore.setDailyCalories(plan?.dailyCalories ?? 0)
  patientProgressStore.calculateDailyCalories()
  patientProgressStore.calculateDailyAdherence()
})

function validateFoodLog() {
  validation.mealType = !form.mealType ? t('patient.foodLog.mealTypeRequired') : ''
  validation.description = !form.description.trim() ? t('patient.foodLog.descriptionRequired') : ''
  validation.calories =
    !form.calories || Number(form.calories) <= 0 ? t('patient.foodLog.caloriesRequired') : ''
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
        <p class="microcopy">{{ t('patient.foodLog.eyebrow') }}</p>
        <h1>{{ t('patient.foodLog.title') }}</h1>
        <p class="text-muted">{{ todayLabel }}</p>
      </div>
    </header>
    <section v-if="!patientPlanStore.hasActivePlan" class="bt-lock-card">
      <div>
        <p class="microcopy">{{ t('patient.foodLog.trackingBlocked') }}</p>
        <h2>{{ t('patient.foodLog.needsActivePlan') }}</h2>
        <p class="text-muted">{{ t('patient.foodLog.needsActivePlanDetail') }}</p>
      </div>
    </section>
    <template v-else>
      <section class="bt-food-summary-grid">
        <article class="bt-patient-card bt-patient-card--blue">
          <span>{{ t('patient.foodLog.consumedCalories') }}</span><strong>{{ patientProgressStore.dailyConsumedCalories }} kcal</strong><small>{{ t('patient.foodLog.dailyGoal', { kcal: patientProgressStore.dailyCalories }) }}</small>
        </article>
        <article class="bt-patient-card">
          <span>{{ t('patient.foodLog.dailyAdherence') }}</span><strong>{{ patientProgressStore.dailyAdherence.value.toFixed(0) }}%</strong><ProgressBar :value="patientProgressStore.dailyAdherence.value.toFixed(2)" />
        </article>
      </section>
      <section class="bt-food-grid">
        <article class="bt-dashboard-panel">
          <h3>{{ t('patient.foodLog.addFood') }}</h3>
          <Message v-if="patientProgressStore.error" severity="error">{{ patientProgressStore.error }}</Message>
          <Message v-if="patientProgressStore.savedRecently" severity="success">{{ t('patient.foodLog.savedSuccess') }}</Message>
          <form class="bt-food-form" @submit.prevent="submitFoodLog">
            <label>{{ t('patient.foodLog.mealType') }}<Select v-model="form.mealType" :options="mealOptions" option-label="label" option-value="value" :invalid="Boolean(validation.mealType)" /></label>
            <p v-if="validation.mealType" class="bt-auth-helper">{{ validation.mealType }}</p>
            <label>{{ t('patient.foodLog.description') }}<InputText v-model="form.description" :invalid="Boolean(validation.description)" /></label>
            <p v-if="validation.description" class="bt-auth-helper">{{ validation.description }}</p>
            <label>{{ t('patient.foodLog.calories') }}<InputNumber v-model="form.calories" :min="1" :invalid="Boolean(validation.calories)" /></label>
            <p v-if="validation.calories" class="bt-auth-helper">{{ validation.calories }}</p>
            <Button :label="t('patient.foodLog.saveConsumption')" :loading="patientProgressStore.loading" type="submit" />
          </form>
        </article>
        <article class="bt-dashboard-panel">
          <h3>{{ t('patient.foodLog.todayFoods') }}</h3>
          <div v-if="patientProgressStore.getTodayFoodLogs.length" class="bt-food-log-list">
            <div v-for="log in patientProgressStore.getTodayFoodLogs" :key="`${log.date}-${log.mealType}`" class="bt-meal-row">
              <span>{{ mealIcons[log.mealType] }}</span><div><strong>{{ log.description }}</strong><small>{{ t('mealTypes.' + log.mealType, log.mealType) }}</small></div><em>{{ log.calories }} kcal</em>
            </div>
          </div>
          <p v-else class="text-muted">{{ t('patient.foodLog.noFoodsToday') }}</p>
        </article>
      </section>
    </template>
  </section>
</template>
