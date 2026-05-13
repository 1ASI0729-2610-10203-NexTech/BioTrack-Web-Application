<script setup>
import { computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import InputNumber from 'primevue/inputnumber'
import Message from 'primevue/message'
import Select from 'primevue/select'
import { usePatientPlanStore } from '../../../nutritional-planning/application/patient-plan.store'
import { usePatientProgressStore } from '../../application/patient-progress.store'

const router = useRouter()
const planStore = usePatientPlanStore()
const progressStore = usePatientProgressStore()
const activityOptions = ['caminar', 'correr', 'bicicleta', 'gimnasio', 'yoga', 'otro']
const intensityOptions = ['baja', 'media', 'alta']
const form = reactive({ type: '', durationMinutes: null, intensity: '' })
const validation = reactive({ type: '', durationMinutes: '', intensity: '' })
const burnedCalories = computed(() => progressStore.calculateActivityCalories(form))

onMounted(async () => {
  await planStore.fetchPatientPlan()
  await progressStore.fetchProgressData()
})

function validate() {
  validation.type = !form.type ? 'Selecciona una actividad.' : ''
  validation.durationMinutes =
    !form.durationMinutes || form.durationMinutes <= 0 ? 'La duracion debe ser mayor a 0.' : ''
  validation.intensity = !form.intensity ? 'Selecciona intensidad.' : ''
  return !validation.type && !validation.durationMinutes && !validation.intensity
}
async function submit() {
  if (!planStore.hasActivePlan || !validate()) return
  const saved = await progressStore.addActivityLog(form)
  if (saved) {
    form.type = ''
    form.durationMinutes = null
    form.intensity = ''
  }
}
</script>

<template>
  <section class="bt-activity-page">
    <header class="bt-patient-heading"><div><p class="microcopy">US28</p><h1>Registrar actividad fisica</h1><p class="text-muted">Calculamos calorias quemadas con una regla mock simple.</p></div></header>
    <section v-if="!planStore.hasActivePlan" class="bt-lock-card">
      <div><h2>Aun no tienes un plan nutricional activo</h2><p class="text-muted">Activa tu plan para registrar actividad como seguimiento.</p></div>
      <Button label="Ir a Plan Nutricional" @click="router.push('/nutritional-plan')" />
    </section>
    <template v-else>
      <Message v-if="progressStore.activitySavedRecently" severity="success">Actividad guardada correctamente.</Message>
      <section class="bt-form-with-side">
        <form class="bt-dashboard-panel bt-food-form" @submit.prevent="submit">
          <label>Tipo de actividad<Select v-model="form.type" :options="activityOptions" :invalid="Boolean(validation.type)" /></label>
          <p v-if="validation.type" class="bt-auth-helper">{{ validation.type }}</p>
          <label>Duracion en minutos<InputNumber v-model="form.durationMinutes" :min="1" :invalid="Boolean(validation.durationMinutes)" /></label>
          <p v-if="validation.durationMinutes" class="bt-auth-helper">{{ validation.durationMinutes }}</p>
          <label>Intensidad<Select v-model="form.intensity" :options="intensityOptions" :invalid="Boolean(validation.intensity)" /></label>
          <p v-if="validation.intensity" class="bt-auth-helper">{{ validation.intensity }}</p>
          <article class="bt-mini-stat"><span>Calorias quemadas estimadas</span><strong>{{ burnedCalories }} kcal</strong></article>
          <Button label="Guardar actividad" :loading="progressStore.loading" type="submit" />
        </form>
        <aside class="bt-dashboard-panel">
          <h3>Actividad de la semana</h3>
          <p class="text-muted">{{ progressStore.weeklyActivityMinutes }} minutos · {{ progressStore.weeklyBurnedCalories }} kcal</p>
          <div class="bt-food-log-list">
            <div v-for="record in progressStore.getWeeklyActivityLogs" :key="`${record.date}-${record.type}-${record.durationMinutes}`" class="bt-meal-row">
              <span>🏃</span><div><strong>{{ record.type }}</strong><small>{{ record.durationMinutes }} min · {{ record.intensity }}</small></div><em>{{ record.burnedCalories }} kcal</em>
            </div>
          </div>
        </aside>
      </section>
    </template>
  </section>
</template>
