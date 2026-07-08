<script setup>
import { computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import InputNumber from 'primevue/inputnumber'
import Message from 'primevue/message'
import Select from 'primevue/select'
import { usePatientPlanStore } from '../../../nutritional-planning/application/patient-plan.store'
import { usePatientProgressStore } from '../../application/patient-progress.store'

const { t } = useI18n()
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
  validation.type = !form.type ? t('patient.activity.typeRequired') : ''
  validation.durationMinutes =
    !form.durationMinutes || form.durationMinutes <= 0 ? t('patient.activity.durationRequired') : ''
  validation.intensity = !form.intensity ? t('patient.activity.intensityRequired') : ''
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
    <header class="bt-patient-heading"><div><h1>{{ t('patient.activity.title') }}</h1><p class="text-muted">{{ t('patient.activity.subtitle') }}</p></div></header>
    <section v-if="!planStore.hasActivePlan" class="bt-lock-card">
      <div><h2>{{ t('patient.activity.noActivePlan') }}</h2><p class="text-muted">{{ t('patient.activity.noActivePlanDetail') }}</p></div>
      <Button :label="t('patient.activity.goToNutritionalPlan')" @click="router.push('/nutritional-plan')" />
    </section>
    <template v-else>
      <Message v-if="progressStore.activitySavedRecently" severity="success">{{ t('patient.activity.activitySaved') }}</Message>
      <section class="bt-form-with-side">
        <form class="bt-dashboard-panel bt-food-form" @submit.prevent="submit">
          <label>{{ t('patient.activity.activityType') }}<Select v-model="form.type" :options="activityOptions" :invalid="Boolean(validation.type)" /></label>
          <p v-if="validation.type" class="bt-auth-helper">{{ validation.type }}</p>
          <label>{{ t('patient.activity.durationMinutes') }}<InputNumber v-model="form.durationMinutes" :min="1" :invalid="Boolean(validation.durationMinutes)" /></label>
          <p v-if="validation.durationMinutes" class="bt-auth-helper">{{ validation.durationMinutes }}</p>
          <label>{{ t('patient.activity.intensity') }}<Select v-model="form.intensity" :options="intensityOptions" :invalid="Boolean(validation.intensity)" /></label>
          <p v-if="validation.intensity" class="bt-auth-helper">{{ validation.intensity }}</p>
          <article class="bt-mini-stat"><span>{{ t('patient.activity.estimatedCalories') }}</span><strong>{{ burnedCalories }} kcal</strong></article>
          <Button :label="t('patient.activity.saveActivity')" :loading="progressStore.loading" type="submit" />
        </form>
        <aside class="bt-dashboard-panel">
          <h3>{{ t('patient.activity.weeklyActivity') }}</h3>
          <p class="text-muted">{{ t('patient.activity.weeklyStats', { minutes: progressStore.weeklyActivityMinutes, kcal: progressStore.weeklyBurnedCalories }) }}</p>
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
