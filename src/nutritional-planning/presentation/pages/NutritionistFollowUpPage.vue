<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import Message from 'primevue/message'
import Textarea from 'primevue/textarea'
import { useNutritionistStore } from '../../application/nutritionist.store'

const route = useRoute()
const toast = useToast()
const nutritionistStore = useNutritionistStore()
const patientId = computed(() => Number(route.params.patientId))
const patient = computed(() => nutritionistStore.selectedPatient)
const note = ref('')

onMounted(() => {
  nutritionistStore.fetchPatientProgress(patientId.value)
})

function formatKg(value) {
  return value == null ? '-' : `${Number(value).toFixed(1)} kg`
}

async function saveNote() {
  try {
    await nutritionistStore.saveFollowUpNote(patientId.value, note.value)
    note.value = ''
    toast.add({ severity: 'success', summary: 'Nota registrada', detail: 'La nota de seguimiento fue guardada.', life: 3000 })
    await nutritionistStore.fetchPatientProgress(patientId.value)
  } catch {
    toast.add({ severity: 'error', summary: 'No se pudo guardar', detail: nutritionistStore.error, life: 3500 })
  }
}
</script>

<template>
  <section class="bt-patient-page">
    <header class="bt-patient-heading">
      <div>
        <p class="microcopy">Seguimiento</p>
        <h1>{{ patient?.name ?? 'Paciente' }}</h1>
        <p class="text-muted">Resumen textual de peso, adherencia y consumo registrado.</p>
      </div>
    </header>

    <section v-if="patient" class="bt-progress-summary-grid">
      <article class="bt-patient-card"><span>Peso inicial</span><strong>{{ formatKg(patient.initialWeight) }}</strong></article>
      <article class="bt-patient-card"><span>Peso actual</span><strong>{{ formatKg(patient.currentWeight) }}</strong></article>
      <article class="bt-patient-card"><span>Meta</span><strong>{{ formatKg(patient.targetWeightKg) }}</strong></article>
      <article class="bt-patient-card"><span>IMC</span><strong>{{ patient.bmi }} · {{ patient.bmiStatus }}</strong></article>
      <article class="bt-patient-card bt-patient-card--blue"><span>Adherencia</span><strong>{{ patient.adherence.percentage }}%</strong><small>{{ patient.adherence.label }}</small></article>
    </section>

    <section v-if="patient" class="bt-plan-grid">
      <article class="bt-dashboard-panel">
        <h3>Registros de comida</h3>
        <div v-if="patient.foodLogs.length" class="bt-list-stack">
          <div v-for="log in patient.foodLogs" :key="log.id ?? `${log.date}-${log.mealType}`" class="bt-meal-row">
            <span>{{ log.mealType }}</span>
            <div><strong>{{ log.description }}</strong><small>{{ log.date }}</small></div>
            <em>{{ log.calories }} kcal</em>
          </div>
        </div>
        <p v-else class="text-muted">Sin registros de comida.</p>
      </article>

      <article class="bt-dashboard-panel">
        <h3>Últimos pesos</h3>
        <div v-if="patient.weightRecords.length" class="bt-list-stack">
          <div v-for="record in patient.weightRecords.slice(-6)" :key="record.id ?? record.date" class="bt-meal-row">
            <span>{{ record.date }}</span>
            <div><strong>{{ record.weightKg }} kg</strong><small>{{ record.comment }}</small></div>
          </div>
        </div>
        <p v-else class="text-muted">Sin registros de peso.</p>
      </article>
    </section>

    <section class="bt-dashboard-panel bt-form-grid">
      <h3>Notas de seguimiento</h3>
      <Message v-if="nutritionistStore.error" severity="error">{{ nutritionistStore.error }}</Message>
      <Textarea v-model="note" rows="4" auto-resize placeholder="Registra una nota breve de seguimiento" />
      <Button label="Guardar nota" :loading="nutritionistStore.loading" @click="saveNote" />
      <div v-if="nutritionistStore.followUpNotes.length" class="bt-list-stack">
        <div v-for="item in nutritionistStore.followUpNotes" :key="item.id" class="bt-note-item">
          <strong>{{ new Date(item.createdAt).toLocaleDateString('es-PE') }}</strong>
          <p>{{ item.note }}</p>
        </div>
      </div>
    </section>
  </section>
</template>
