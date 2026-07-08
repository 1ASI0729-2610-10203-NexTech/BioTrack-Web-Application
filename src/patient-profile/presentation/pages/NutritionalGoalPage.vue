<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { usePatientProfileStore } from '../../application/patient-profile.store'

const { t } = useI18n()
const router = useRouter()
const profileStore = usePatientProfileStore()
const selectedGoal = ref(profileStore.nutritionalGoal?.value ?? '')
const attemptedSave = ref(false)
const saved = ref(false)
const goals = [
  { value: 'bajar-peso', label: t('nutritionalGoal.loseWeight'), description: t('nutritionalGoal.loseWeightDesc') },
  { value: 'mantener-peso', label: t('nutritionalGoal.maintainWeight'), description: t('nutritionalGoal.maintainWeightDesc') },
  { value: 'ganar-masa', label: t('nutritionalGoal.gainMass'), description: t('nutritionalGoal.gainMassDesc') },
]
const hasError = computed(() => attemptedSave.value && !selectedGoal.value)
const previewInitialWeight = computed(
  () => profileStore.initialWeight ?? profileStore.healthData?.weightKg ?? null,
)
const targetWeightPreview = computed(() =>
  selectedGoal.value && previewInitialWeight.value
    ? profileStore.calculateTargetWeight(previewInitialWeight.value, selectedGoal.value)
    : null,
)
const targetWeightMessage = computed(() =>
  profileStore.getWeightGoalMessage(
    targetWeightPreview.value,
    previewInitialWeight.value,
    selectedGoal.value,
  ),
)

async function saveGoal() {
  attemptedSave.value = true
  saved.value = false
  if (!selectedGoal.value) return
  await profileStore.saveNutritionalGoal(selectedGoal.value)
  saved.value = true
}

onMounted(async () => {
  await profileStore.fetchPatientProfile()
  selectedGoal.value = profileStore.nutritionalGoal?.value ?? ''
})
</script>

<template>
  <section class="bt-goal-page">
    <header class="bt-patient-heading">
      <div>
        <h1>{{ t('nutritionalGoal.title') }}</h1>
        <p class="text-muted">{{ t('nutritionalGoal.subtitle') }}</p>
      </div>
    </header>
    <Message v-if="hasError" severity="error">{{ t('nutritionalGoal.goalRequired') }}</Message>
    <Message v-if="saved" severity="success">{{ t('nutritionalGoal.goalSaved') }}</Message>
    <Message severity="info">{{ targetWeightMessage }}</Message>
    <section class="bt-goal-grid">
      <button
        v-for="goal in goals"
        :key="goal.value"
        type="button"
        class="bt-goal-card"
        :class="{ 'bt-goal-card--active': selectedGoal === goal.value }"
        @click="selectedGoal = goal.value"
      >
        <span class="bt-goal-check">✓</span>
        <strong>{{ goal.label }}</strong>
        <small>{{ goal.description }}</small>
      </button>
    </section>
    <div class="bt-inline-actions">
      <Button :label="t('nutritionalGoal.saveGoal')" :disabled="!selectedGoal" @click="saveGoal" />
      <Button :label="t('nutritionalGoal.backToProfile')" outlined @click="router.push('/patient-profile')" />
    </div>
  </section>
</template>
