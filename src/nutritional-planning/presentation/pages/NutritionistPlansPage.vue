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

function statusSeverity(status) {
  if (status === 'ACTIVATED') return 'success'
  if (status === 'PROPOSED') return 'warn'
  if (status === 'REJECTED') return 'danger'
  return 'secondary'
}

async function changePlanStatus(patient, status) {
  if (!patient.plan?.id) return
  await nutritionistStore.updatePlanStatus(patient.id, patient.plan.id, status)
}
</script>

<template>
  <section class="bt-patient-page">
    <header class="bt-patient-heading">
      <div>
        <p class="microcopy">{{ t('nutritionist.plans.eyebrow') }}</p>
        <h1>{{ t('nutritionist.plans.title') }}</h1>
        <p class="text-muted">{{ t('nutritionist.plans.subtitle') }}</p>
      </div>
    </header>

    <article class="bt-dashboard-panel">
      <DataTable
        :value="nutritionistStore.assignedPatients"
        :loading="nutritionistStore.loading"
        responsive-layout="scroll"
        data-key="id"
      >
        <Column field="name" :header="t('nutritionist.plans.colPatient')" />
        <Column :header="t('nutritionist.plans.colPlan')">
          <template #body="{ data }">{{ data.plan?.name ?? t('nutritionist.plans.noPlan') }}</template>
        </Column>
        <Column :header="t('nutritionist.plans.colStatus')">
          <template #body="{ data }">
            <Tag :value="data.planStatus" :severity="statusSeverity(data.planStatus)" />
          </template>
        </Column>
        <Column :header="t('nutritionist.plans.colCalories')">
          <template #body="{ data }">{{ data.dailyCalories ?? '-' }}</template>
        </Column>
        <Column :header="t('nutritionist.plans.colAction')">
          <template #body="{ data }">
            <div class="bt-table-actions">
              <Button
                :label="data.plan ? t('nutritionist.plans.viewPatient') : t('nutritionist.plans.createPlan')"
                outlined
                @click="router.push(data.plan ? `/nutritionist-patients/${data.id}` : `/nutritionist-plans/create/${data.id}`)"
              />
              <Button
                v-if="data.plan && data.planStatus !== 'PROPOSED'"
                :label="t('nutritionist.plans.propose')"
                text
                @click="changePlanStatus(data, 'PROPOSED')"
              />
              <Button
                v-if="data.plan && data.planStatus !== 'ACTIVATED'"
                :label="t('nutritionist.plans.activate')"
                text
                @click="changePlanStatus(data, 'ACTIVATED')"
              />
              <Button
                v-if="data.plan && data.planStatus !== 'REJECTED'"
                :label="t('nutritionist.plans.reject')"
                text
                severity="danger"
                @click="changePlanStatus(data, 'REJECTED')"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </article>
  </section>
</template>
