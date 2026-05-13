<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { usePatientProfileStore } from '../../application/patient-profile.store'

const router = useRouter()
const profileStore = usePatientProfileStore()
const selectedGoal = ref(profileStore.nutritionalGoal?.value ?? '')
const attemptedSave = ref(false)
const saved = ref(false)
const goals = [
  { value: 'bajar-peso', label: 'Bajar de peso', description: 'Reducir grasa con un plan sostenible.' },
  { value: 'mantener-peso', label: 'Mantener peso', description: 'Conservar equilibrio y energia estable.' },
  { value: 'ganar-masa', label: 'Ganar masa muscular', description: 'Impulsar rendimiento y fuerza.' },
]
const hasError = computed(() => attemptedSave.value && !selectedGoal.value)

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
        <p class="microcopy">US10</p>
        <h1>Seleccionar objetivo nutricional</h1>
        <p class="text-muted">Elige el enfoque que guiara tu plan nutricional.</p>
      </div>
    </header>
    <Message v-if="hasError" severity="error">Debes seleccionar un objetivo antes de continuar.</Message>
    <Message v-if="saved" severity="success">Objetivo nutricional guardado correctamente.</Message>
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
      <Button label="Guardar objetivo" :disabled="!selectedGoal" @click="saveGoal" />
      <Button label="Volver al perfil" outlined @click="router.push('/patient-profile')" />
    </div>
  </section>
</template>
