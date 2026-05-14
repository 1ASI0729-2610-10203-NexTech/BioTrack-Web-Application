<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import { useNutritionistStore } from '../../application/nutritionist.store'

const router = useRouter()
const nutritionistStore = useNutritionistStore()

onMounted(() => {
  nutritionistStore.fetchAssignedPatients()
})

function adherenceSeverity(value) {
  if (value >= 90) return 'success'
  if (value >= 70) return 'info'
  return 'danger'
}

function goToPatient(patientId) {
  router.push(`/nutritionist-patients/${patientId}`)
}
</script>

<template>
  <section class="bt-patient-page">
    <header class="bt-patient-heading">
      <div>
        <p class="microcopy">Nutricionista</p>
        <h1>Dashboard del nutricionista</h1>
        <p class="text-muted">Pacientes asignados, evaluaciones y seguimiento básico.</p>
      </div>
      <Button label="Ver pacientes" icon="pi pi-users" @click="router.push('/nutritionist-patients')" />
    </header>

    <section class="bt-patient-summary-grid">
      <article class="bt-patient-card bt-patient-card--blue">
        <span>Pacientes asignados</span>
        <strong>{{ nutritionistStore.totalAssignedPatients }}</strong>
      </article>
      <article class="bt-patient-card">
        <span>Perfiles completos</span>
        <strong>{{ nutritionistStore.completeProfilesCount }}</strong>
      </article>
      <article class="bt-patient-card">
        <span>Planes activos</span>
        <strong>{{ nutritionistStore.activePlansCount }}</strong>
      </article>
      <article class="bt-patient-card">
        <span>Pendientes de evaluación</span>
        <strong>{{ nutritionistStore.pendingEvaluationCount }}</strong>
      </article>
      <article class="bt-patient-card">
        <span>Baja adherencia</span>
        <strong>{{ nutritionistStore.lowAdherenceCount }}</strong>
      </article>
    </section>

    <section class="bt-dashboard-panel">
      <div class="bt-panel-header">
        <div>
          <h3>Pacientes recientes</h3>
          <p class="text-muted">Solo se muestran pacientes asignados a tu perfil.</p>
        </div>
      </div>

      <div class="bt-nutritionist-patient-grid">
        <article
          v-for="patient in nutritionistStore.recentPatients"
          :key="patient.id"
          class="bt-nutritionist-patient-card"
        >
          <div>
            <h3>{{ patient.name }}</h3>
            <p class="text-muted">{{ patient.nutritionalGoalLabel }}</p>
          </div>
          <div class="bt-nutritionist-card-meta">
            <span>IMC {{ patient.bmi }}</span>
            <Tag :value="patient.planStatus" severity="info" />
            <Tag
              :value="`${patient.adherence.percentage}% ${patient.adherence.label}`"
              :severity="adherenceSeverity(patient.adherence.percentage)"
            />
          </div>
          <Button label="Ver paciente" outlined @click="goToPatient(patient.id)" />
        </article>
      </div>
    </section>
  </section>
</template>
