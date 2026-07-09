<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import { useNutritionistStore } from '../../application/nutritionist.store'

const { t } = useI18n()
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
        <p class="microcopy">{{ t('nutritionist.dashboard.eyebrow') }}</p>
        <h1>{{ t('nutritionist.dashboard.title') }}</h1>
        <p class="text-muted">{{ t('nutritionist.dashboard.subtitle') }}</p>
      </div>
      <Button :label="t('nutritionist.dashboard.viewPatients')" icon="pi pi-users" @click="router.push('/nutritionist-patients')" />
    </header>

    <section class="bt-patient-summary-grid">
      <article class="bt-patient-card bt-patient-card--blue">
        <span>{{ t('nutritionist.dashboard.assignedPatients') }}</span>
        <strong>{{ nutritionistStore.totalAssignedPatients }}</strong>
      </article>
      <article class="bt-patient-card">
        <span>{{ t('nutritionist.dashboard.completeProfiles') }}</span>
        <strong>{{ nutritionistStore.completeProfilesCount }}</strong>
      </article>
      <article class="bt-patient-card">
        <span>{{ t('nutritionist.dashboard.activePlans') }}</span>
        <strong>{{ nutritionistStore.activePlansCount }}</strong>
      </article>
      <article class="bt-patient-card">
        <span>{{ t('nutritionist.dashboard.pendingEvaluation') }}</span>
        <strong>{{ nutritionistStore.pendingEvaluationCount }}</strong>
      </article>
      <article class="bt-patient-card">
        <span>{{ t('nutritionist.dashboard.lowAdherence') }}</span>
        <strong>{{ nutritionistStore.lowAdherenceCount }}</strong>
      </article>
    </section>

    <section class="bt-dashboard-panel">
      <div class="bt-panel-header">
        <div>
          <h3>{{ t('nutritionist.dashboard.recentPatients') }}</h3>
          <p class="text-muted">{{ t('nutritionist.dashboard.recentPatientsSubtitle') }}</p>
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
          <Button :label="t('nutritionist.dashboard.viewPatient')" outlined @click="goToPatient(patient.id)" />
        </article>
      </div>
    </section>
  </section>
</template>
