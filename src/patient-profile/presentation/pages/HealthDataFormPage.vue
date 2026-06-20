<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
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
const hasTriedSubmit = ref(false)
watch(form, () => { if (hasTriedSubmit.value) validate() }, { deep: true })

function validate() {
  validation.weightKg =
    form.weightKg == null ? 'Peso es obligatorio.' :
    form.weightKg < 10 || form.weightKg > 300 ? 'Peso entre 10 y 300 kg.' : ''
  validation.heightCm =
    form.heightCm == null ? 'Talla es obligatoria.' :
    form.heightCm < 50 || form.heightCm > 250 ? 'Talla entre 50 y 250 cm.' : ''
  validation.age =
    form.age == null ? 'Edad es obligatoria.' :
    form.age < 1 || form.age > 120 ? 'Edad entre 1 y 120 años.' : ''
  validation.biologicalSex = !form.biologicalSex ? 'Selecciona el sexo biologico.' : ''
  validation.activityLevel = !form.activityLevel ? 'Selecciona el nivel de actividad.' : ''
  validation.systolic =
    form.systolic == null ? 'Presion sistolica es obligatoria.' :
    form.systolic < 50 || form.systolic > 300 ? 'Sistolica entre 50 y 300 mmHg.' : ''
  validation.diastolic =
    form.diastolic == null ? 'Presion diastolica es obligatoria.' :
    form.diastolic < 20 || form.diastolic > 200 ? 'Diastolica entre 20 y 200 mmHg.' : ''
  validation.glucoseMgDl =
    form.glucoseMgDl == null ? 'Glucosa basal es obligatoria.' :
    form.glucoseMgDl < 50 || form.glucoseMgDl > 300 ? 'Glucosa entre 50 y 300 mg/dL.' : ''
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
        <h1>Registrar datos de salud</h1>
        <p class="text-muted">Actualiza tus datos clinicos con validaciones claras.</p>
      </div>
    </header>
    <Message v-if="profileStore.savedRecently" severity="success">Datos de salud guardados correctamente.</Message>
    <Message v-if="errors.length" severity="error">Completa todos los campos obligatorios antes de guardar.</Message>
    <section class="bt-form-with-side">
      <form class="bt-dashboard-panel bt-health-form" @submit.prevent="submit">
        <div class="bt-two-col-form">
          <label>Peso kg<InputNumber v-model="form.weightKg" :invalid="Boolean(validation.weightKg)" /></label>
          <label>Talla cm<InputNumber v-model="form.heightCm" :invalid="Boolean(validation.heightCm)" /></label>
          <label>Edad<InputNumber v-model="form.age" :invalid="Boolean(validation.age)" /></label>
          <label>Sexo biologico<Select v-model="form.biologicalSex" :options="sexOptions" :invalid="Boolean(validation.biologicalSex)" /></label>
          <label>Nivel de actividad<Select v-model="form.activityLevel" :options="activityOptions" :invalid="Boolean(validation.activityLevel)" /></label>
          <label>Glucosa basal<InputNumber v-model="form.glucoseMgDl" :invalid="Boolean(validation.glucoseMgDl)" /></label>
          <label>Presion sistolica<InputNumber v-model="form.systolic" :invalid="Boolean(validation.systolic)" /></label>
          <label>Presion diastolica<InputNumber v-model="form.diastolic" :invalid="Boolean(validation.diastolic)" /></label>
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
