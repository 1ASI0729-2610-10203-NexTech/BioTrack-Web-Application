<script setup>
import { computed, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Textarea from 'primevue/textarea'
import { useNutritionistStore } from '../../application/nutritionist.store'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const nutritionistStore = useNutritionistStore()
const patientId = computed(() => Number(route.params.patientId))
const patient = computed(() => nutritionistStore.selectedPatient)

const form = reactive({
  name: 'Plan Nutricional — Semana 1',
  dailyCalories: 1850,
  proteinPercentage: 35,
  carbohydratePercentage: 45,
  fatPercentage: 20,
  description: 'Plan semanal personalizado según evaluación nutricional.',
})

const macroTotal = computed(
  () => Number(form.proteinPercentage || 0) + Number(form.carbohydratePercentage || 0) + Number(form.fatPercentage || 0),
)

onMounted(() => {
  nutritionistStore.fetchPatientDetail(patientId.value)
})

async function submit() {
  try {
    await nutritionistStore.createPlan(patientId.value, form)
    toast.add({ severity: 'success', summary: 'Plan creado', detail: 'El plan quedó propuesto para el paciente.', life: 3000 })
    router.push(`/nutritionist-patients/${patientId.value}`)
  } catch {
    toast.add({ severity: 'error', summary: 'No se pudo crear', detail: nutritionistStore.error, life: 3500 })
  }
}
</script>

<template>
  <section class="bt-patient-page">
    <header class="bt-patient-heading">
      <div>
        <p class="microcopy">Plan nutricional</p>
        <h1>Crear plan nutricional</h1>
        <p class="text-muted">Solo puedes crear planes para pacientes asignados con perfil completo.</p>
      </div>
    </header>

    <Message v-if="patient && !patient.isComplete" severity="warn">
      No se puede crear un plan nutricional porque el perfil del paciente está incompleto.
    </Message>

    <form v-if="patient?.isComplete" class="bt-dashboard-panel bt-form-grid" @submit.prevent="submit">
      <Message v-if="nutritionistStore.error" severity="error">{{ nutritionistStore.error }}</Message>
      <label>
        Nombre del plan
        <InputText v-model="form.name" />
      </label>
      <label>
        Calorías diarias
        <InputNumber v-model="form.dailyCalories" :min="1" suffix=" kcal" />
      </label>
      <div class="bt-auth-grid">
        <label>Proteínas %<InputNumber v-model="form.proteinPercentage" :min="0" :max="100" /></label>
        <label>Carbohidratos %<InputNumber v-model="form.carbohydratePercentage" :min="0" :max="100" /></label>
        <label>Grasas %<InputNumber v-model="form.fatPercentage" :min="0" :max="100" /></label>
      </div>
      <label>
        Descripción
        <Textarea v-model="form.description" rows="4" auto-resize />
      </label>
      <Message :severity="macroTotal === 100 ? 'success' : 'warn'">
        Suma de macronutrientes: {{ macroTotal }}%
      </Message>
      <Button label="Crear plan propuesto" type="submit" :loading="nutritionistStore.loading" />
    </form>
  </section>
</template>
