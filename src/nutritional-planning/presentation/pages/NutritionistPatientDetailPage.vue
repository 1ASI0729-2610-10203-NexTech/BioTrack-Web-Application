<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import { useNutritionistStore } from '../../application/nutritionist.store'

const { t } = useI18n()
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
        <p class="microcopy">{{ t('nutritionist.patientDetail.eyebrow') }}</p>
        <h1>{{ patient?.name ?? t('nutritionist.patientDetail.defaultName') }}</h1>
        <p class="text-muted">{{ t('nutritionist.patientDetail.subtitle') }}</p>
      </div>
      <div class="bt-inline-actions">
        <Button :label="t('nutritionist.patientDetail.createEvaluation')" outlined @click="router.push(`/nutritionist-evaluations/${patientId}`)" />
        <Button :label="t('nutritionist.patientDetail.createPlan')" @click="router.push(`/nutritionist-plans/create/${patientId}`)" />
        <Button :label="t('nutritionist.patientDetail.followUp')" outlined @click="router.push(`/nutritionist-follow-up/${patientId}`)" />
      </div>
    </header>

    <section v-if="patient" class="bt-plan-grid">
      <article class="bt-dashboard-panel">
        <h3>{{ t('nutritionist.patientDetail.profileData') }}</h3>
        <div class="bt-detail-grid">
          <span>{{ t('nutritionist.patientDetail.initialWeight') }} <strong>{{ formatKg(patient.initialWeight) }}</strong></span>
          <span>{{ t('nutritionist.patientDetail.currentWeight') }} <strong>{{ formatKg(patient.currentWeight) }}</strong></span>
          <span>{{ t('nutritionist.patientDetail.height') }} <strong>{{ patient.heightCm }} cm</strong></span>
          <span>{{ t('nutritionist.patientDetail.bmi') }} <strong>{{ patient.bmi }} · {{ patient.bmiStatus }}</strong></span>
          <span>{{ t('nutritionist.patientDetail.goal') }} <strong>{{ patient.nutritionalGoalLabel }}</strong></span>
          <span>{{ t('nutritionist.patientDetail.targetWeight') }} <strong>{{ formatKg(patient.targetWeightKg) }}</strong></span>
          <span>{{ t('nutritionist.patientDetail.bloodPressure') }} <strong>{{ patient.systolicPressure != null ? `${patient.systolicPressure}/${patient.diastolicPressure}` : '-' }}</strong></span>
          <span>{{ t('nutritionist.patientDetail.glucose') }} <strong>{{ patient.basalGlucose != null ? `${patient.basalGlucose} mg/dL` : '-' }}</strong></span>
        </div>
        <p class="text-muted">
          {{ t('nutritionist.patientDetail.restrictions') }}:
          {{ patient.dietaryRestrictions?.length ? patient.dietaryRestrictions.join(', ') : t('nutritionist.patientDetail.noRestrictions') }}
        </p>
      </article>

      <aside class="bt-plan-side">
        <article class="bt-plan-highlight">
          <span>{{ t('nutritionist.patientDetail.currentPlan') }}</span>
          <strong>{{ patient.planStatus === 'ACTIVATED' ? t('nutritionist.patientDetail.planActive') : patient.planStatus === 'DRAFT' ? t('nutritionist.patientDetail.planDraft') : patient.planStatus ?? '-' }}</strong>
          <small>{{ t('nutritionist.patientDetail.dailyKcal', { kcal: patient.dailyCalories ?? 0 }) }}</small>
        </article>
        <article class="bt-dashboard-panel">
          <h3>{{ t('nutritionist.patientDetail.macronutrients') }}</h3>
          <div v-if="patient.macros" class="bt-detail-grid">
            <span>{{ t('nutritionist.patientDetail.proteins') }} <strong>{{ patient.macros.proteins }}%</strong></span>
            <span>{{ t('nutritionist.patientDetail.carbohydrates') }} <strong>{{ patient.macros.carbohydrates }}%</strong></span>
            <span>{{ t('nutritionist.patientDetail.fats') }} <strong>{{ patient.macros.fats }}%</strong></span>
          </div>
          <p v-else class="text-muted">{{ t('nutritionist.patientDetail.noNutritionalPlan') }}</p>
        </article>
      </aside>
    </section>

    <section v-if="patient" class="bt-progress-summary-grid">
      <article class="bt-patient-card">
        <span>{{ t('nutritionist.patientDetail.differenceFromStart') }}</span>
        <strong>{{ formatKg(patient.weightChange) }}</strong>
      </article>
      <article class="bt-patient-card">
        <span>{{ t('nutritionist.patientDetail.remainingToGoal') }}</span>
        <strong>{{ formatKg(patient.remainingToGoal) }}</strong>
      </article>
      <article class="bt-patient-card bt-patient-card--blue">
        <span>{{ t('nutritionist.patientDetail.adherence') }}</span>
        <strong>{{ patient.adherence?.percentage ?? 0 }}%</strong>
        <small>{{ patient.adherence?.label ?? '' }}</small>
      </article>
    </section>

    <section v-if="patient" class="bt-plan-grid">
      <article class="bt-dashboard-panel">
        <h3>{{ t('nutritionist.patientDetail.lastFoodLogs') }}</h3>
        <div v-if="patient.foodLogs?.length" class="bt-list-stack">
          <div v-for="log in patient.foodLogs.slice(-5)" :key="log.id ?? `${log.date}-${log.mealType}`" class="bt-meal-row">
            <span>{{ t('mealTypes.' + log.mealType, log.mealType) }}</span>
            <div><strong>{{ log.description }}</strong><small>{{ log.date }}</small></div>
            <em>{{ log.calories }} kcal</em>
          </div>
        </div>
        <p v-else class="text-muted">{{ t('nutritionist.patientDetail.noFoodLogs') }}</p>
      </article>

      <article class="bt-dashboard-panel">
        <h3>{{ t('nutritionist.patientDetail.notesAndEvaluation') }}</h3>
        <p class="text-muted">
          {{ t('nutritionist.patientDetail.lastEvaluation') }}:
          {{ patient.lastEvaluation?.observations ?? patient.lastEvaluation?.notes ?? t('nutritionist.patientDetail.noEvaluation') }}
        </p>
        <p class="text-muted">
          {{ t('nutritionist.patientDetail.lastNote') }}:
          {{ patient.lastNote?.note ?? t('nutritionist.patientDetail.noNotes') }}
        </p>
      </article>
    </section>
  </section>
</template>
