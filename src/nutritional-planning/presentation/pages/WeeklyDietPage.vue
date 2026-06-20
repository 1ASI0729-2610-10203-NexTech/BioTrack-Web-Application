<script setup>
import { onMounted } from 'vue'
import Button from 'primevue/button'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { usePatientPlanStore } from '../../application/patient-plan.store'

const { t } = useI18n()
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
        <p class="microcopy">{{ t('weeklyDiet.eyebrow') }}</p>
        <h1>{{ t('weeklyDiet.title') }}</h1>
        <p class="text-muted">{{ t('weeklyDiet.subtitle') }}</p>
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
        <p class="microcopy">{{ t('weeklyDiet.trackingBlocked') }}</p>
        <h2>{{ t('weeklyDiet.noActivePlan') }}</h2>
        <p class="text-muted">{{ t('weeklyDiet.noActivePlanDetail') }}</p>
      </div>
      <Button :label="t('weeklyDiet.reviewPlan')" @click="router.push('/nutritional-plan')" />
    </section>
  </section>
</template>
