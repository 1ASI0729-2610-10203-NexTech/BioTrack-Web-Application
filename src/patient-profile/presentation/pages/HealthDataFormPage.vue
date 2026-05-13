<script setup>
import { computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import InputNumber from 'primevue/inputnumber'
import Message from 'primevue/message'
import Select from 'primevue/select'
import { usePatientProfileStore } from '../../application/patient-profile.store'

const router = useRouter()
const profileStore = usePatientProfileStore()
const health = profileStore.healthData
const form = reactive({
  weightKg: health.weightKg,
  heightCm: health.heightCm,
  age: health.age,
  biologicalSex: health.biologicalSex.value,
  activityLevel: health.activityLevel.value,
  systolic: health.bloodPressure.systolic,
  diastolic: health.bloodPressure.diastolic,
  glucoseMgDl: health.glucoseMgDl,
})
const validation = reactive({})
const sexOptions = ['masculino', 'femenino', 'otro', 'prefiero-no-decir']
const activityOptions = ['sedentaria', 'moderada', 'activa']

const bmiPreview = computed(() => {
  if (!form.weightKg || !form.heightCm) return null
  return profileStore.calculateBMI(form.weightKg, form.heightCm)
})
const bmiLabel = computed(() => {
  const value = bmiPreview.value?.value ?? 0
  if (!value) return 'Pendiente'
  if (value < 18.5) return 'Bajo peso'
  if (value < 25) return 'Normal'
  if (value < 30) return 'Sobrepeso'
  return 'Obesidad'
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
  await profileStore.saveHealthData(form)
}
</script>

<template>
  <section class="bt-profile-form-page">
    <header class="bt-patient-heading">
      <div>
        <p class="microcopy">US09</p>
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
        <strong>{{ bmiPreview?.value?.toFixed(2) ?? '--' }}</strong>
        <span>{{ bmiLabel }}</span>
        <p>Calorias recomendadas: {{ profileStore.getRecommendedCalories() }} kcal</p>
        <ul v-if="errors.length" class="bt-error-list">
          <li v-for="error in errors" :key="error">{{ error }}</li>
        </ul>
      </aside>
    </section>
  </section>
</template>
