<script setup>
import { computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import { usePatientPlanStore } from '../../../nutritional-planning/application/patient-plan.store'
import { usePatientProgressStore } from '../../application/patient-progress.store'

const router = useRouter()
const planStore = usePatientPlanStore()
const progressStore = usePatientProgressStore()
const form = reactive({ weightKg: null, date: new Date().toISOString().slice(0, 10), comment: '' })
const validation = reactive({ weightKg: '', date: '' })
const differenceInitial = computed(() => progressStore.weightChange)
const differenceTarget = computed(() => progressStore.remainingToGoal)

onMounted(async () => {
  await planStore.fetchPatientPlan()
  await progressStore.fetchProgressData()
  form.weightKg = progressStore.currentWeight ?? form.weightKg
})

function formatKg(value) {
  return value == null ? '-' : `${Number(value).toFixed(1)} kg`
}

function validate() {
  validation.weightKg = form.weightKg < 10 || form.weightKg > 300 ? 'Peso entre 10 y 300 kg.' : ''
  validation.date = !form.date ? 'La fecha es obligatoria.' : ''
  return !validation.weightKg && !validation.date
}
async function submit() {
  if (!planStore.hasActivePlan || !validate()) return
  await progressStore.updateWeight(form)
}
</script>

<template>
  <section class="bt-weight-page">
    <header class="bt-patient-heading"><div><h1>Actualizar peso semanal</h1><p class="text-muted">Controla tu evolucion con un registro simple.</p></div></header>
    <section v-if="!planStore.hasActivePlan" class="bt-lock-card">
      <div><h2>Aun no tienes un plan nutricional activo</h2><p class="text-muted">Activa tu plan para registrar peso dentro del seguimiento.</p></div>
      <Button label="Ir a Plan Nutricional" @click="router.push('/nutritional-plan')" />
    </section>
    <template v-else>
      <Message v-if="progressStore.error" severity="error">{{ progressStore.error }}</Message>
      <Message v-if="progressStore.weightSavedRecently" severity="success">Peso actualizado correctamente.</Message>
      <section class="bt-form-with-side">
        <form class="bt-dashboard-panel bt-food-form" @submit.prevent="submit">
          <label>Peso actual<InputNumber v-model="form.weightKg" :min="10" :max="300" :invalid="Boolean(validation.weightKg)" /></label>
          <p v-if="validation.weightKg" class="bt-auth-helper">{{ validation.weightKg }}</p>
          <label>Fecha<InputText v-model="form.date" type="date" :invalid="Boolean(validation.date)" /></label>
          <p v-if="validation.date" class="bt-auth-helper">{{ validation.date }}</p>
          <label>Comentario opcional<InputText v-model="form.comment" placeholder="Me senti con buena energia" /></label>
          <Button label="Guardar peso" :loading="progressStore.loading" type="submit" />
        </form>
        <aside class="bt-dashboard-panel">
          <h3>Resumen de peso</h3>
          <div class="bt-data-list">
            <div><dt>Diferencia vs inicial</dt><dd>{{ formatKg(differenceInitial) }}</dd></div>
            <div><dt>Restante para meta</dt><dd>{{ formatKg(differenceTarget) }}</dd></div>
          </div>
          <div class="bt-food-log-list">
            <div v-for="record in progressStore.getWeightHistory" :key="record.date" class="bt-meal-row">
              <span>⚖️</span><div><strong>{{ record.weightKg }} kg</strong><small>{{ record.date }} · {{ record.type }} · {{ record.comment || 'Sin comentario' }}</small></div>
            </div>
          </div>
        </aside>
      </section>
    </template>
  </section>
</template>
