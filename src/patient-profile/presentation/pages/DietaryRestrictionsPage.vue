<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import MultiSelect from 'primevue/multiselect'
import { usePatientProfileStore } from '../../application/patient-profile.store'

const { t } = useI18n()
const router = useRouter()
const profileStore = usePatientProfileStore()
const restrictionOptions = [
  t('dietaryRestrictions.noRestrictions'),
  t('dietaryRestrictions.lactose'),
  t('dietaryRestrictions.gluten'),
  t('dietaryRestrictions.nuts'),
  t('dietaryRestrictions.seafood'),
  t('dietaryRestrictions.egg'),
  t('dietaryRestrictions.vegetarian'),
  t('dietaryRestrictions.vegan'),
  t('dietaryRestrictions.diabetes'),
  t('dietaryRestrictions.hypertension'),
  t('dietaryRestrictions.other'),
]
const selectedRestrictions = ref(
  profileStore.dietaryRestrictions.map((restriction) => restriction.label),
)
const otherRestriction = ref('')
const attemptedSave = ref(false)
const saved = ref(false)
const saveError = ref('')
const needsOther = computed(() => selectedRestrictions.value.includes(t('dietaryRestrictions.other')))
const hasSelection = computed(() => selectedRestrictions.value.length > 0)
const hasOtherError = computed(
  () => attemptedSave.value && needsOther.value && !otherRestriction.value.trim(),
)

function normalizeSelection(value) {
  if (value.includes(t('dietaryRestrictions.noRestrictions'))) {
    selectedRestrictions.value = [t('dietaryRestrictions.noRestrictions')]
    return
  }
  selectedRestrictions.value = value
}

async function saveRestrictions() {
  attemptedSave.value = true
  saved.value = false
  saveError.value = ''
  if (!hasSelection.value || hasOtherError.value) return
  const restrictions = selectedRestrictions.value.map((restriction) =>
    restriction === t('dietaryRestrictions.other') ? otherRestriction.value.trim() : restriction,
  )
  try {
    await profileStore.saveDietaryRestrictions(restrictions)
    saved.value = true
  } catch (error) {
    saveError.value = error?.message ?? t('patient.plan.needsCompleteProfile')
  }
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
        <h1>{{ t('dietaryRestrictions.title') }}</h1>
        <p class="text-muted">{{ t('dietaryRestrictions.subtitle') }}</p>
      </div>
    </header>
    <Message v-if="attemptedSave && !hasSelection" severity="error">{{ t('dietaryRestrictions.selectionRequired') }}</Message>
    <Message v-if="saved" severity="success">{{ t('dietaryRestrictions.restrictionsSaved') }}</Message>
    <Message v-if="saveError" severity="error">{{ saveError }}</Message>
    <section class="bt-dashboard-panel bt-restrictions-card">
      <label>
        {{ t('dietaryRestrictions.restrictions') }}
        <MultiSelect
          :model-value="selectedRestrictions"
          :options="restrictionOptions"
          :placeholder="t('dietaryRestrictions.placeholder')"
          display="chip"
          @update:model-value="normalizeSelection"
        />
      </label>
      <label v-if="needsOther">
        {{ t('dietaryRestrictions.specifyOther') }}
        <InputText v-model="otherRestriction" :invalid="hasOtherError" :placeholder="t('dietaryRestrictions.specifyOtherPlaceholder')" />
      </label>
      <p v-if="hasOtherError" class="bt-auth-helper">{{ t('dietaryRestrictions.otherRequired') }}</p>
      <div class="bt-inline-actions">
        <Button :label="t('dietaryRestrictions.saveRestrictions')" :disabled="!hasSelection" @click="saveRestrictions" />
        <Button :label="t('dietaryRestrictions.backToProfile')" outlined @click="router.push('/patient-profile')" />
      </div>
    </section>
  </section>
</template>
