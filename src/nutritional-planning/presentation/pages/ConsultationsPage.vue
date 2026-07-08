<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import { useIdentityAccessStore } from '../../../identity-access/application/identity-access.store'
import { useNutritionistStore } from '../../application/nutritionist.store'
import { apiService } from '../../../shared/infrastructure/api.service'

const { t } = useI18n()
const identityStore = useIdentityAccessStore()
const nutritionistStore = useNutritionistStore()

const isNutritionist = computed(() => {
  const role = identityStore.currentUser?.role
  return role === 'NUTRICIONISTA' || role === 'NUTRITIONIST'
})

const patientOptions = computed(() =>
  nutritionistStore.assignedPatients.map((p) => ({ label: p.name, value: p.id })),
)

const form = reactive({ patientId: null, date: new Date().toISOString().slice(0, 10), topic: '', notes: '' })
const validation = reactive({ patientId: '', date: '' })
const consultations = ref([])
const loading = ref(false)
const saving = ref(false)
const savedRecently = ref(false)
const error = ref('')

async function fetchConsultations() {
  loading.value = true
  error.value = ''
  try {
    const data = await apiService.get('/consultations')
    consultations.value = data.consultations ?? []
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

function validate() {
  validation.patientId = isNutritionist.value && !form.patientId ? t('consultations.patientRequired') : ''
  validation.date = !form.date ? t('consultations.dateRequired') : ''
  return !validation.patientId && !validation.date
}

async function submit() {
  if (!validate()) return
  saving.value = true
  savedRecently.value = false
  error.value = ''
  try {
    const created = await apiService.post('/consultations', {
      patientId: form.patientId,
      date: form.date,
      topic: form.topic,
      notes: form.notes,
    })
    consultations.value = [created, ...consultations.value]
    form.topic = ''
    form.notes = ''
    savedRecently.value = true
  } catch (err) {
    error.value = err.message
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  if (isNutritionist.value) {
    await nutritionistStore.fetchAssignedPatients()
  }
  await fetchConsultations()
})
</script>

<template>
  <section class="bt-patient-page">
    <header class="bt-patient-heading">
      <div>
        <p class="microcopy">{{ t('consultations.eyebrow') }}</p>
        <h1>{{ t('consultations.title') }}</h1>
        <p class="text-muted">{{ t('consultations.subtitle') }}</p>
      </div>
    </header>

    <section v-if="isNutritionist" class="bt-plan-grid">
      <form class="bt-dashboard-panel bt-form-grid" @submit.prevent="submit">
        <h3>{{ t('consultations.newConsultation') }}</h3>
        <Message v-if="error" severity="error">{{ error }}</Message>
        <Message v-if="savedRecently" severity="success">{{ t('consultations.savedSuccess') }}</Message>

        <label>
          {{ t('consultations.patient') }}
          <Select
            v-model="form.patientId"
            :options="patientOptions"
            option-label="label"
            option-value="value"
            :placeholder="t('consultations.selectPatient')"
            :invalid="Boolean(validation.patientId)"
          />
        </label>
        <p v-if="validation.patientId" class="bt-auth-helper">{{ validation.patientId }}</p>

        <label>
          {{ t('consultations.date') }}
          <InputText v-model="form.date" type="date" :invalid="Boolean(validation.date)" />
        </label>
        <p v-if="validation.date" class="bt-auth-helper">{{ validation.date }}</p>

        <label>
          {{ t('consultations.topic') }}
          <InputText v-model="form.topic" :placeholder="t('consultations.topicPlaceholder')" />
        </label>

        <label>
          {{ t('consultations.notes') }}
          <Textarea v-model="form.notes" rows="4" auto-resize :placeholder="t('consultations.notesPlaceholder')" />
        </label>

        <Button :label="t('consultations.save')" type="submit" :loading="saving" />
      </form>

      <article class="bt-dashboard-panel">
        <h3>{{ t('consultations.title') }}</h3>
        <div v-if="loading" class="text-muted">{{ t('common.loading') }}</div>
        <div v-else-if="consultations.length" class="bt-list-stack">
          <div v-for="c in consultations" :key="c.id" class="bt-note-item">
            <div class="bt-note-header">
              <strong>{{ c.patientName }}</strong>
              <span class="text-muted">{{ c.date }}</span>
            </div>
            <p v-if="c.topic" class="bt-note-topic">{{ c.topic }}</p>
            <p v-if="c.notes" class="text-muted">{{ c.notes }}</p>
          </div>
        </div>
        <p v-else class="text-muted">{{ t('consultations.noConsultations') }}</p>
      </article>
    </section>

    <article v-else class="bt-dashboard-panel">
      <h3>{{ t('consultations.title') }}</h3>
      <div v-if="loading" class="text-muted">{{ t('common.loading') }}</div>
      <div v-else-if="consultations.length" class="bt-list-stack">
        <div v-for="c in consultations" :key="c.id" class="bt-note-item">
          <div class="bt-note-header">
            <strong>{{ c.nutritionistName }}</strong>
            <span class="text-muted">{{ c.date }}</span>
          </div>
          <p v-if="c.topic" class="bt-note-topic">{{ c.topic }}</p>
          <p v-if="c.notes" class="text-muted">{{ c.notes }}</p>
        </div>
      </div>
      <p v-else class="text-muted">{{ t('consultations.noConsultations') }}</p>
    </article>
  </section>
</template>

<style scoped>
.bt-note-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}
.bt-note-topic {
  font-weight: 600;
  font-size: 0.875rem;
  margin: 0.25rem 0;
}
</style>
