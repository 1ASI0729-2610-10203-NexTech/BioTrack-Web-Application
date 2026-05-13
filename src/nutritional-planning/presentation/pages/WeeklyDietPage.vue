<script setup>
import { onMounted } from 'vue'
import Button from 'primevue/button'
import { useRouter } from 'vue-router'
import { usePatientPlanStore } from '../../application/patient-plan.store'

const router = useRouter()
const patientPlanStore = usePatientPlanStore()

onMounted(() => {
  patientPlanStore.fetchPatientPlan()
})
</script>

<template>
  <section class="bt-weekly-page">
    <header class="bt-patient-heading">
      <div>
        <p class="microcopy">Dieta semanal</p>
        <h1>Vista de Dieta Semanal</h1>
        <p class="text-muted">Organiza tu semana nutricional con un plan claro y ligero.</p>
      </div>
    </header>

    <section v-if="patientPlanStore.hasActivePlan" class="bt-weekly-grid">
      <article v-for="day in patientPlanStore.weeklyDiet?.days ?? []" :key="day.name" class="bt-dashboard-panel">
        <h3>{{ day.name }}</h3>
        <div class="bt-day-meals">
          <div v-for="meal in day.meals" :key="`${day.name}-${meal.type}`" class="bt-meal-row">
            <span>{{ meal.icon }}</span>
            <div>
              <strong>{{ meal.name }}</strong>
              <small>{{ meal.description }}</small>
            </div>
            <em>{{ meal.calories }} kcal</em>
          </div>
        </div>
      </article>
    </section>

    <section v-else class="bt-lock-card">
      <div>
        <p class="microcopy">Seguimiento bloqueado</p>
        <h2>Aun no tienes un plan nutricional activo.</h2>
        <p class="text-muted">Activa tu plan para visualizar la dieta semanal.</p>
      </div>
      <Button label="Revisar plan nutricional" @click="router.push('/nutritional-plan')" />
    </section>
  </section>
</template>
