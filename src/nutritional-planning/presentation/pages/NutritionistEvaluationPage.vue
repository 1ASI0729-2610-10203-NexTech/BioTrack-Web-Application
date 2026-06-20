<script setup>
import { computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import InputNumber from 'primevue/inputnumber'
import Message from 'primevue/message'
import Textarea from 'primevue/textarea'
import { useNutritionistStore } from '../../application/nutritionist.store'

const { t } = useI18n()
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
    toast.add({ severity: 'success', summary: t('nutritionist.evaluation.successTitle'), detail: t('nutritionist.evaluation.successDetail'), life: 3000 })
    router.push(`/nutritionist-patients/${patientId.value}`)
  } catch {
    toast.add({ severity: 'error', summary: t('nutritionist.evaluation.errorTitle'), detail: nutritionistStore.error, life: 3500 })
  }
}
</script>

<template>
  <section class="bt-patient-page">
    <header class="bt-patient-heading">
      <div>
        <p class="microcopy">{{ t('nutritionist.evaluation.eyebrow') }}</p>
        <h1>{{ t('nutritionist.evaluation.title') }}</h1>
        <p class="text-muted">{{ t('nutritionist.evaluation.subtitle') }}</p>
      </div>
    </header>

    <form class="bt-dashboard-panel bt-form-grid" @submit.prevent="submit">
      <Message v-if="nutritionistStore.error" severity="error">{{ nutritionistStore.error }}</Message>
      <label>
        {{ t('nutritionist.evaluation.clinicalObservations') }}
        <Textarea v-model="form.observations" rows="5" auto-resize />
      </label>
      <label>
        {{ t('nutritionist.evaluation.targetCalories') }}
        <InputNumber v-model="form.targetCalories" :min="1" suffix=" kcal" />
      </label>
      <div class="bt-auth-grid">
        <label>{{ t('nutritionist.evaluation.proteinsPercent') }}<InputNumber v-model="form.proteinPercentage" :min="0" :max="100" /></label>
        <label>{{ t('nutritionist.evaluation.carbohydratesPercent') }}<InputNumber v-model="form.carbohydratePercentage" :min="0" :max="100" /></label>
        <label>{{ t('nutritionist.evaluation.fatsPercent') }}<InputNumber v-model="form.fatPercentage" :min="0" :max="100" /></label>
      </div>
      <Message :severity="macroTotal === 100 ? 'success' : 'warn'">
        {{ t('nutritionist.evaluation.macroSum', { total: macroTotal }) }}
      </Message>
      <Button :label="t('nutritionist.evaluation.saveEvaluation')" type="submit" :loading="nutritionistStore.loading" />
    </form>
  </section>
</template>
