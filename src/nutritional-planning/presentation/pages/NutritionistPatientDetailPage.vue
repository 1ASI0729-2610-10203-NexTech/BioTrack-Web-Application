<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import { useNutritionistStore } from '../../application/nutritionist.store'

const route = useRoute()
const router = useRouter()
const nutritionistStore = useNutritionistStore()

const patientId = computed(() => Number(route.params.id))
const patient = computed(() => nutritionistStore.selectedPatient)

onMounted(() => {
  nutritionistStore.fetchPatientDetail(patientId.value)
})

function formatKg(value) {
  return value == null ? '-' : `${Number(value).toFixed(1)} kg`
}
</script>

<template>
  <section class="bt-patient-page">
    <header class="bt-patient-heading">
      <div>
        <p class="microcopy">Detalle del paciente</p>
        <h1>{{ patient?.name ?? 'Paciente' }}</h1>
        <p class="text-muted">Perfil de salud, plan, progreso y notas de seguimiento.</p>
      </div>
      <div class="bt-inline-actions">
        <Button label="Crear evaluación" outlined @click="router.push(`/nutritionist-evaluations/${patientId}`)" />
        <Button label="Crear plan" @click="router.push(`/nutritionist-plans/create/${patientId}`)" />
        <Button label="Seguimiento" outlined @click="router.push(`/nutritionist-follow-up/${patientId}`)" />
      </div>
    </header>

    <section v-if="patient" class="bt-plan-grid">
      <article class="bt-dashboard-panel">
        <h3>Datos de perfil</h3>
        <div class="bt-detail-grid">
          <span>Peso inicial <strong>{{ formatKg(patient.initialWeight) }}</strong></span>
          <span>Peso actual <strong>{{ formatKg(patient.currentWeight) }}</strong></span>
          <span>Talla <strong>{{ patient.heightCm }} cm</strong></span>
          <span>IMC <strong>{{ patient.bmi }} · {{ patient.bmiStatus }}</strong></span>
          <span>Objetivo <strong>{{ patient.nutritionalGoalLabel }}</strong></span>
          <span>Peso objetivo <strong>{{ formatKg(patient.targetWeightKg) }}</strong></span>
          <span>Presión arterial <strong>{{ patient.systolicPressure != null ? `${patient.systolicPressure}/${patient.diastolicPressure}` : '-' }}</strong></span>
          <span>Glucosa <strong>{{ patient.basalGlucose != null ? `${patient.basalGlucose} mg/dL` : '-' }}</strong></span>
        </div>
        <p class="text-muted">
          Restricciones:
          {{ patient.dietaryRestrictions?.length ? patient.dietaryRestrictions.join(', ') : 'Sin restricciones' }}
        </p>
      </article>

      <aside class="bt-plan-side">
        <article class="bt-plan-highlight">
          <span>Plan actual</span>
          <strong>{{ patient.planStatus === 'ACTIVATED' ? 'Activo' : patient.planStatus === 'DRAFT' ? 'Borrador' : patient.planStatus ?? '-' }}</strong>
          <small>{{ patient.dailyCalories ?? 0 }} kcal diarias</small>
        </article>
        <article class="bt-dashboard-panel">
          <h3>Macronutrientes</h3>
          <div v-if="patient.macros" class="bt-detail-grid">
            <span>Proteínas <strong>{{ patient.macros.proteins }}%</strong></span>
            <span>Carbohidratos <strong>{{ patient.macros.carbohydrates }}%</strong></span>
            <span>Grasas <strong>{{ patient.macros.fats }}%</strong></span>
          </div>
          <p v-else class="text-muted">Aún no existe un plan nutricional.</p>
        </article>
      </aside>
    </section>

    <section v-if="patient" class="bt-progress-summary-grid">
      <article class="bt-patient-card">
        <span>Diferencia desde inicio</span>
        <strong>{{ formatKg(patient.weightChange) }}</strong>
      </article>
      <article class="bt-patient-card">
        <span>Restante hacia meta</span>
        <strong>{{ formatKg(patient.remainingToGoal) }}</strong>
      </article>
      <article class="bt-patient-card bt-patient-card--blue">
        <span>Adherencia</span>
        <strong>{{ patient.adherence?.percentage ?? 0 }}%</strong>
        <small>{{ patient.adherence?.label ?? '' }}</small>
      </article>
    </section>

    <section v-if="patient" class="bt-plan-grid">
      <article class="bt-dashboard-panel">
        <h3>Últimos registros de comida</h3>
        <div v-if="patient.foodLogs?.length" class="bt-list-stack">
          <div v-for="log in patient.foodLogs.slice(-5)" :key="log.id ?? `${log.date}-${log.mealType}`" class="bt-meal-row">
            <span>{{ log.mealType }}</span>
            <div><strong>{{ log.description }}</strong><small>{{ log.date }}</small></div>
            <em>{{ log.calories }} kcal</em>
          </div>
        </div>
        <p v-else class="text-muted">Sin registros de comida.</p>
      </article>

      <article class="bt-dashboard-panel">
        <h3>Notas y evaluación</h3>
        <p class="text-muted">
          Última evaluación:
          {{ patient.lastEvaluation?.observations ?? patient.lastEvaluation?.notes ?? 'Sin evaluación registrada.' }}
        </p>
        <p class="text-muted">
          Última nota:
          {{ patient.lastNote?.note ?? 'Sin notas de seguimiento.' }}
        </p>
      </article>
    </section>
  </section>
</template>
