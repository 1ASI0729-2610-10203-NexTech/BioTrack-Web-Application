<script setup>
import { computed, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Textarea from 'primevue/textarea'
import { useNutritionistStore } from '../../application/nutritionist.store'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const toast = useToast()
const nutritionistStore = useNutritionistStore()
const patientId = computed(() => Number(route.params.patientId))
const patient = computed(() => nutritionistStore.selectedPatient)

const form = reactive({
  name: t('nutritionist.createPlan.defaultPlanName'),
  dailyCalories: 1850,
  proteinPercentage: 35,
  carbohydratePercentage: 45,
  fatPercentage: 20,
  description: t('nutritionist.createPlan.defaultDescription'),
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
    toast.add({ severity: 'success', summary: t('nutritionist.createPlan.successTitle'), detail: t('nutritionist.createPlan.successDetail'), life: 3000 })
    router.push(`/nutritionist-patients/${patientId.value}`)
  } catch {
    toast.add({ severity: 'error', summary: t('nutritionist.createPlan.errorTitle'), detail: nutritionistStore.error, life: 3500 })
  }
}
</script>

<template>
  <section class="bt-patient-page">
    <header class="bt-patient-heading">
      <div>
        <p class="microcopy">{{ t('nutritionist.createPlan.eyebrow') }}</p>
        <h1>{{ t('nutritionist.createPlan.title') }}</h1>
        <p class="text-muted">{{ t('nutritionist.createPlan.subtitle') }}</p>
      </div>
    </header>

    <Message v-if="patient && !patient.isComplete" severity="warn">
      {{ t('nutritionist.createPlan.incompleteProfile') }}
    </Message>

    <form class="bt-dashboard-panel bt-form-grid" @submit.prevent="submit">
      <Message v-if="nutritionistStore.error" severity="error">{{ nutritionistStore.error }}</Message>
      <label>
        {{ t('nutritionist.createPlan.planName') }}
        <InputText v-model="form.name" />
      </label>
      <label>
        {{ t('nutritionist.createPlan.dailyCalories') }}
        <InputNumber v-model="form.dailyCalories" :min="1" suffix=" kcal" />
      </label>
      <div class="bt-auth-grid">
        <label>{{ t('nutritionist.createPlan.proteinsPercent') }}<InputNumber v-model="form.proteinPercentage" :min="0" :max="100" /></label>
        <label>{{ t('nutritionist.createPlan.carbohydratesPercent') }}<InputNumber v-model="form.carbohydratePercentage" :min="0" :max="100" /></label>
        <label>{{ t('nutritionist.createPlan.fatsPercent') }}<InputNumber v-model="form.fatPercentage" :min="0" :max="100" /></label>
      </div>
      <label>
        {{ t('nutritionist.createPlan.planDescription') }}
        <Textarea v-model="form.description" rows="4" auto-resize />
      </label>
      <Message :severity="macroTotal === 100 ? 'success' : 'warn'">
        {{ t('nutritionist.createPlan.macroSum', { total: macroTotal }) }}
      </Message>
      <Button :label="t('nutritionist.createPlan.createProposed')" type="submit" :loading="nutritionistStore.loading" />
    </form>
  </section>
</template>
