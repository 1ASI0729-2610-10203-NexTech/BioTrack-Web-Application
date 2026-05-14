<script setup>
import { computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import InputNumber from 'primevue/inputnumber'
import Message from 'primevue/message'
import Textarea from 'primevue/textarea'
import { useNutritionistStore } from '../../application/nutritionist.store'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const nutritionistStore = useNutritionistStore()
const patientId = computed(() => Number(route.params.patientId))

const form = reactive({
  observations: '',
  targetCalories: 1850,
  proteinPercentage: 35,
  carbohydratePercentage: 45,
  fatPercentage: 20,
})

const macroTotal = computed(
  () => Number(form.proteinPercentage || 0) + Number(form.carbohydratePercentage || 0) + Number(form.fatPercentage || 0),
)

async function submit() {
  try {
    await nutritionistStore.createEvaluation(patientId.value, form)
    toast.add({ severity: 'success', summary: 'Evaluación creada', detail: 'La evaluación fue registrada.', life: 3000 })
    router.push(`/nutritionist-patients/${patientId.value}`)
  } catch {
    toast.add({ severity: 'error', summary: 'No se pudo guardar', detail: nutritionistStore.error, life: 3500 })
  }
}
</script>

<template>
  <section class="bt-patient-page">
    <header class="bt-patient-heading">
      <div>
        <p class="microcopy">Evaluación nutricional</p>
        <h1>Crear evaluación</h1>
        <p class="text-muted">Registra observaciones clínicas y distribución de macronutrientes.</p>
      </div>
    </header>

    <form class="bt-dashboard-panel bt-form-grid" @submit.prevent="submit">
      <Message v-if="nutritionistStore.error" severity="error">{{ nutritionistStore.error }}</Message>
      <label>
        Observaciones clínicas
        <Textarea v-model="form.observations" rows="5" auto-resize />
      </label>
      <label>
        Calorías objetivo
        <InputNumber v-model="form.targetCalories" :min="1" suffix=" kcal" />
      </label>
      <div class="bt-auth-grid">
        <label>Proteínas %<InputNumber v-model="form.proteinPercentage" :min="0" :max="100" /></label>
        <label>Carbohidratos %<InputNumber v-model="form.carbohydratePercentage" :min="0" :max="100" /></label>
        <label>Grasas %<InputNumber v-model="form.fatPercentage" :min="0" :max="100" /></label>
      </div>
      <Message :severity="macroTotal === 100 ? 'success' : 'warn'">
        Suma de macronutrientes: {{ macroTotal }}%
      </Message>
      <Button label="Guardar evaluación" type="submit" :loading="nutritionistStore.loading" />
    </form>
  </section>
</template>
