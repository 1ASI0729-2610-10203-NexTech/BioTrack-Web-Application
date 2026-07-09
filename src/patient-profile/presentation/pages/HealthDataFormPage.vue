<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import InputNumber from 'primevue/inputnumber'
import Message from 'primevue/message'
import Select from 'primevue/select'
import { usePatientProfileStore } from '../../application/patient-profile.store'

const { t } = useI18n()
const router = useRouter()
const toast = useToast()
const profileStore = usePatientProfileStore()
const form = reactive({
  weightKg: null,
  heightCm: null,
  age: null,
  biologicalSex: '',
  activityLevel: '',
  systolic: null,
  diastolic: null,
  glucoseMgDl: null,
})
const validation = reactive({})
const sexOptions = ['masculino', 'femenino', 'otro', 'prefiero-no-decir']
const activityOptions = ['sedentaria', 'moderada', 'activa']

const bmiPreview = computed(() => {
  if (!form.weightKg || !form.heightCm) return null
  return profileStore.calculateBMI(form.weightKg, form.heightCm)
})
const bmiLabel = computed(() => {
  return profileStore.getBMIStatus(bmiPreview.value?.value)
})
const targetWeightPreview = computed(() => {
  if (!form.weightKg || !profileStore.nutritionalGoal) return null
  return profileStore.calculateTargetWeight(form.weightKg, profileStore.nutritionalGoal)
})
const targetWeightMessage = computed(() => {
  return profileStore.getWeightGoalMessage(
    targetWeightPreview.value,
    form.weightKg,
    profileStore.nutritionalGoal,
  )
})
const errors = computed(() => Object.values(validation).filter(Boolean))
const canSave = computed(() => errors.value.length === 0)
const hasTriedSubmit = ref(false)
watch(form, () => { if (hasTriedSubmit.value) validate() }, { deep: true })

function validate() {
  validation.weightKg =
    form.weightKg == null ? t('healthData.weightRequired') :
    form.weightKg < 10 || form.weightKg > 300 ? t('healthData.weightRange') : ''
  validation.heightCm =
    form.heightCm == null ? t('healthData.heightRequired') :
    form.heightCm < 50 || form.heightCm > 250 ? t('healthData.heightRange') : ''
  validation.age =
    form.age == null ? t('healthData.ageRequired') :
    form.age < 1 || form.age > 120 ? t('healthData.ageRange') : ''
  validation.biologicalSex = !form.biologicalSex ? t('healthData.biologicalSexRequired') : ''
  validation.activityLevel = !form.activityLevel ? t('healthData.activityLevelRequired') : ''
  validation.systolic =
    form.systolic == null ? t('healthData.systolicRequired') :
    form.systolic < 50 || form.systolic > 300 ? t('healthData.systolicRange') : ''
  validation.diastolic =
    form.diastolic == null ? t('healthData.diastolicRequired') :
    form.diastolic < 20 || form.diastolic > 200 ? t('healthData.diastolicRange') : ''
  validation.glucoseMgDl =
    form.glucoseMgDl == null ? t('healthData.glucoseRequired') :
    form.glucoseMgDl < 50 || form.glucoseMgDl > 300 ? t('healthData.glucoseRange') : ''
  return errors.value.length === 0
}

async function submit() {
  hasTriedSubmit.value = true
  validate()
  if (!canSave.value) return
  try {
    await profileStore.saveHealthData({ ...form })
    toast.add({
      severity: 'success',
      summary: t('healthData.successTitle'),
      detail: t('healthData.successDetail'),
      life: 3000,
    })
  } catch {
    toast.add({
      severity: 'error',
      summary: t('healthData.errorTitle'),
      detail: t('healthData.errorDetail'),
      life: 3500,
    })
  }
}

onMounted(async () => {
  profileStore.savedRecently = false
  const profile = await profileStore.fetchPatientProfile()
  const health = profile?.healthData
  if (!health) return
  Object.assign(form, {
    weightKg: health.weightKg ?? null,
    heightCm: health.heightCm ?? null,
    age: health.age ?? null,
    biologicalSex: health.biologicalSex?.value ?? '',
    activityLevel: health.activityLevel?.value ?? '',
    systolic: health.bloodPressure?.systolic ?? null,
    diastolic: health.bloodPressure?.diastolic ?? null,
    glucoseMgDl: health.glucoseMgDl ?? null,
  })
})
</script>

<template>
  <section class="bt-profile-form-page">
    <header class="bt-patient-heading">
      <div>
        <h1>{{ t('healthData.title') }}</h1>
        <p class="text-muted">{{ t('healthData.subtitle') }}</p>
      </div>
    </header>
    <Message v-if="profileStore.savedRecently" severity="success">{{ t('healthData.savedSuccess') }}</Message>
    <Message v-if="errors.length" severity="error">{{ t('healthData.requiredFieldsError') }}</Message>
    <section class="bt-form-with-side">
      <form class="bt-dashboard-panel bt-health-form" @submit.prevent="submit">
        <div class="bt-two-col-form">
          <label>{{ t('healthData.weightKg') }}<InputNumber v-model="form.weightKg" :invalid="Boolean(validation.weightKg)" /></label>
          <label>{{ t('healthData.heightCm') }}<InputNumber v-model="form.heightCm" :invalid="Boolean(validation.heightCm)" /></label>
          <label>{{ t('healthData.age') }}<InputNumber v-model="form.age" :invalid="Boolean(validation.age)" /></label>
          <label>{{ t('healthData.biologicalSex') }}<Select v-model="form.biologicalSex" :options="sexOptions" :invalid="Boolean(validation.biologicalSex)" /></label>
          <label>{{ t('healthData.activityLevel') }}<Select v-model="form.activityLevel" :options="activityOptions" :invalid="Boolean(validation.activityLevel)" /></label>
          <label>{{ t('healthData.basalGlucose') }}<InputNumber v-model="form.glucoseMgDl" :invalid="Boolean(validation.glucoseMgDl)" /></label>
          <label>{{ t('healthData.systolicPressure') }}<InputNumber v-model="form.systolic" :invalid="Boolean(validation.systolic)" /></label>
          <label>{{ t('healthData.diastolicPressure') }}<InputNumber v-model="form.diastolic" :invalid="Boolean(validation.diastolic)" /></label>
        </div>
        <div class="bt-inline-actions">
          <Button :label="t('healthData.saveHealthData')" :disabled="!canSave" :loading="profileStore.loading" type="submit" />
          <Button :label="t('healthData.backToProfile')" outlined type="button" @click="router.push('/patient-profile')" />
        </div>
      </form>
      <aside class="bt-dashboard-panel bt-side-insight">
        <h3>{{ t('healthData.estimatedBMI') }}</h3>
        <strong>{{ bmiPreview?.value?.toFixed(1) ?? '--' }}</strong>
        <span>{{ bmiLabel }}</span>
        <h3>{{ t('healthData.recommendedTargetWeight') }}</h3>
        <strong>{{ targetWeightPreview == null ? '--' : `${targetWeightPreview.toFixed(1)} kg` }}</strong>
        <p>{{ targetWeightMessage }}</p>
        <ul v-if="errors.length" class="bt-error-list">
          <li v-for="error in errors" :key="error">{{ error }}</li>
        </ul>
      </aside>
    </section>
  </section>
</template>
