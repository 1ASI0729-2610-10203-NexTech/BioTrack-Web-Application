<script setup>
import { computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import InputNumber from 'primevue/inputnumber'
import Message from 'primevue/message'
import Select from 'primevue/select'
import { usePatientProfileStore } from '../../application/patient-profile.store'

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

function validate() {
  validation.weightKg = form.weightKg < 10 || form.weightKg > 300 ? 'Peso entre 10 y 300 kg.' : ''
  validation.heightCm = form.heightCm < 50 || form.heightCm > 250 ? 'Talla entre 50 y 250 cm.' : ''
  validation.age = form.age < 1 || form.age > 120 ? 'Edad entre 1 y 120.' : ''
  validation.biologicalSex = !form.biologicalSex ? 'Selecciona el sexo biologico.' : ''
  validation.activityLevel = !form.activityLevel ? 'Selecciona el nivel de actividad.' : ''
  validation.systolic = form.systolic < 70 || form.systolic > 220 ? 'Sistolica entre 70 y 220.' : ''
  validation.diastolic = form.diastolic < 40 || form.diastolic > 140 ? 'Diastolica entre 40 y 140.' : ''
  validation.glucoseMgDl =
    form.glucoseMgDl < 50 || form.glucoseMgDl > 300 ? 'Glucosa entre 50 y 300.' : ''
  return errors.value.length === 0
}

async function submit() {
  validate()
  if (!canSave.value) return
  try {
    await profileStore.saveHealthData({ ...form })
    toast.add({
      severity: 'success',
      summary: 'Datos actualizados',
      detail: 'Datos de salud actualizados correctamente',
      life: 3000,
    })
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Error al guardar',
      detail: 'No se pudieron guardar los datos',
      life: 3500,
    })
  }
}

onMounted(async () => {
  const profile = await profileStore.fetchPatientProfile()
  const health = profile?.healthData
  if (!health) return
  Object.assign(form, {
    weightKg: health.weightKg,
    heightCm: health.heightCm,
    age: health.age,
    biologicalSex: health.biologicalSex.value,
    activityLevel: health.activityLevel.value,
    systolic: health.bloodPressure.systolic,
    diastolic: health.bloodPressure.diastolic,
    glucoseMgDl: health.glucoseMgDl,
  })
})
</script>

<template>
  <section class="bt-profile-form-page">
    <header class="bt-patient-heading">
      <div>
        <h1>Registrar datos de salud</h1>
        <p class="text-muted">Actualiza tus datos clinicos con validaciones claras.</p>
      </div>
    </header>
    <Message v-if="profileStore.savedRecently" severity="success">Datos de salud guardados correctamente.</Message>
    <Message v-if="errors.length" severity="error">Hay campos fuera de rango. Revisa el panel lateral.</Message>
    <section class="bt-form-with-side">
      <form class="bt-dashboard-panel bt-health-form" @submit.prevent="submit">
        <div class="bt-two-col-form">
          <label>Peso kg<InputNumber v-model="form.weightKg" :invalid="Boolean(validation.weightKg)" @blur="validate" /></label>
          <label>Talla cm<InputNumber v-model="form.heightCm" :invalid="Boolean(validation.heightCm)" @blur="validate" /></label>
          <label>Edad<InputNumber v-model="form.age" :invalid="Boolean(validation.age)" @blur="validate" /></label>
          <label>Sexo biologico<Select v-model="form.biologicalSex" :options="sexOptions" :invalid="Boolean(validation.biologicalSex)" /></label>
          <label>Nivel de actividad<Select v-model="form.activityLevel" :options="activityOptions" :invalid="Boolean(validation.activityLevel)" /></label>
          <label>Glucosa basal<InputNumber v-model="form.glucoseMgDl" :invalid="Boolean(validation.glucoseMgDl)" @blur="validate" /></label>
          <label>Presion sistolica<InputNumber v-model="form.systolic" :invalid="Boolean(validation.systolic)" @blur="validate" /></label>
          <label>Presion diastolica<InputNumber v-model="form.diastolic" :invalid="Boolean(validation.diastolic)" @blur="validate" /></label>
        </div>
        <div class="bt-inline-actions">
          <Button label="Guardar datos de salud" :disabled="!canSave" :loading="profileStore.loading" type="submit" />
          <Button label="Volver al perfil" outlined type="button" @click="router.push('/patient-profile')" />
        </div>
      </form>
      <aside class="bt-dashboard-panel bt-side-insight">
        <h3>IMC estimado</h3>
        <strong>{{ bmiPreview?.value?.toFixed(1) ?? '--' }}</strong>
        <span>{{ bmiLabel }}</span>
        <h3>Peso objetivo recomendado</h3>
        <strong>{{ targetWeightPreview == null ? '--' : `${targetWeightPreview.toFixed(1)} kg` }}</strong>
        <p>{{ targetWeightMessage }}</p>
        <ul v-if="errors.length" class="bt-error-list">
          <li v-for="error in errors" :key="error">{{ error }}</li>
        </ul>
      </aside>
    </section>
  </section>
</template>
