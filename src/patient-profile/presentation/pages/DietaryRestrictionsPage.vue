<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import MultiSelect from 'primevue/multiselect'
import { usePatientProfileStore } from '../../application/patient-profile.store'

const router = useRouter()
const profileStore = usePatientProfileStore()
const restrictionOptions = [
  'Sin restricciones',
  'Lactosa',
  'Gluten',
  'Frutos secos',
  'Mariscos',
  'Huevo',
  'Vegetarianismo',
  'Veganismo',
  'Diabetes',
  'Hipertension',
  'Otra',
]
const selectedRestrictions = ref(
  profileStore.dietaryRestrictions.map((restriction) => restriction.label),
)
const otherRestriction = ref('')
const attemptedSave = ref(false)
const saved = ref(false)
const needsOther = computed(() => selectedRestrictions.value.includes('Otra'))
const hasSelection = computed(() => selectedRestrictions.value.length > 0)
const hasOtherError = computed(
  () => attemptedSave.value && needsOther.value && !otherRestriction.value.trim(),
)

function normalizeSelection(value) {
  if (value.includes('Sin restricciones')) {
    selectedRestrictions.value = ['Sin restricciones']
    return
  }
  selectedRestrictions.value = value
}

async function saveRestrictions() {
  attemptedSave.value = true
  saved.value = false
  if (!hasSelection.value || hasOtherError.value) return
  const restrictions = selectedRestrictions.value.map((restriction) =>
    restriction === 'Otra' ? otherRestriction.value.trim() : restriction,
  )
  await profileStore.saveDietaryRestrictions(restrictions)
  saved.value = true
}

onMounted(async () => {
  await profileStore.fetchPatientProfile()
  selectedRestrictions.value = profileStore.dietaryRestrictions.map((restriction) => restriction.label)
})
</script>

<template>
  <section class="bt-restrictions-page">
    <header class="bt-patient-heading">
      <div>
        <p class="microcopy">US11</p>
        <h1>Registrar restricciones alimentarias</h1>
        <p class="text-muted">Confirma alergias, condiciones o ausencia de restricciones.</p>
      </div>
    </header>
    <Message v-if="attemptedSave && !hasSelection" severity="error">Selecciona al menos una opcion.</Message>
    <Message v-if="saved" severity="success">Restricciones alimentarias confirmadas.</Message>
    <section class="bt-dashboard-panel bt-restrictions-card">
      <label>
        Restricciones
        <MultiSelect
          :model-value="selectedRestrictions"
          :options="restrictionOptions"
          placeholder="Selecciona restricciones"
          display="chip"
          @update:model-value="normalizeSelection"
        />
      </label>
      <label v-if="needsOther">
        Especifica la restriccion
        <InputText v-model="otherRestriction" :invalid="hasOtherError" placeholder="Describe la restriccion" />
      </label>
      <p v-if="hasOtherError" class="bt-auth-helper">Debes especificar la opcion Otra.</p>
      <div class="bt-inline-actions">
        <Button label="Guardar restricciones" :disabled="!hasSelection" @click="saveRestrictions" />
        <Button label="Volver al perfil" outlined @click="router.push('/patient-profile')" />
      </div>
    </section>
  </section>
</template>
