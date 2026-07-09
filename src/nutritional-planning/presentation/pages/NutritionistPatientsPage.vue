<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Tag from 'primevue/tag'
import { useNutritionistStore } from '../../application/nutritionist.store'

const { t } = useI18n()
const router = useRouter()
const nutritionistStore = useNutritionistStore()

onMounted(() => {
  nutritionistStore.fetchAssignedPatients()
})

function planSeverity(status) {
  if (status === 'ACTIVATED') return 'success'
  if (status === 'PROPOSED') return 'warn'
  if (status === 'REJECTED') return 'danger'
  return 'secondary'
}
</script>

<template>
  <section class="bt-patient-page">
    <header class="bt-patient-heading">
      <div>
        <p class="microcopy">{{ t('nutritionist.patients.eyebrow') }}</p>
        <h1>{{ t('nutritionist.patients.title') }}</h1>
        <p class="text-muted">{{ t('nutritionist.patients.subtitle') }}</p>
      </div>
    </header>

    <article class="bt-dashboard-panel">
      <DataTable
        :value="nutritionistStore.assignedPatients"
        :loading="nutritionistStore.loading"
        responsive-layout="scroll"
        data-key="id"
      >
        <Column field="name" :header="t('nutritionist.patients.colPatient')" />
        <Column field="age" :header="t('nutritionist.patients.colAge')" />
        <Column :header="t('nutritionist.patients.colWeight')">
          <template #body="{ data }">{{ data.currentWeight ?? data.weightKg }} kg</template>
        </Column>
        <Column field="bmi" :header="t('nutritionist.patients.colBMI')" />
        <Column field="nutritionalGoalLabel" :header="t('nutritionist.patients.colGoal')" />
        <Column :header="t('nutritionist.patients.colProfile')">
          <template #body="{ data }">
            <Tag
              :value="data.isComplete ? t('nutritionist.patients.profileComplete') : t('nutritionist.patients.profileIncomplete')"
              :severity="data.isComplete ? 'success' : 'warn'"
            />
          </template>
        </Column>
        <Column :header="t('nutritionist.patients.colPlan')">
          <template #body="{ data }">
            <Tag :value="data.planStatus" :severity="planSeverity(data.planStatus)" />
          </template>
        </Column>
        <Column :header="t('nutritionist.patients.colAdherence')">
          <template #body="{ data }">{{ data.adherence.percentage }}%</template>
        </Column>
        <Column field="updatedAt" :header="t('nutritionist.patients.colLastUpdate')" />
        <Column :header="t('nutritionist.patients.colActions')">
          <template #body="{ data }">
            <div class="bt-table-actions">
              <Button icon="pi pi-eye" text rounded :aria-label="t('nutritionist.patients.ariaView')" @click="router.push(`/nutritionist-patients/${data.id}`)" />
              <Button icon="pi pi-clipboard" text rounded :aria-label="t('nutritionist.patients.ariaEvaluate')" @click="router.push(`/nutritionist-evaluations/${data.id}`)" />
              <Button icon="pi pi-plus" text rounded :aria-label="t('nutritionist.patients.ariaCreatePlan')" @click="router.push(`/nutritionist-plans/create/${data.id}`)" />
              <Button icon="pi pi-comments" text rounded :aria-label="t('nutritionist.patients.ariaFollowUp')" @click="router.push(`/nutritionist-follow-up/${data.id}`)" />
            </div>
          </template>
        </Column>
      </DataTable>
    </article>
  </section>
</template>
