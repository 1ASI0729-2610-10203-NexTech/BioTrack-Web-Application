<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Tag from 'primevue/tag'
import { useNutritionistStore } from '../../application/nutritionist.store'

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
        <p class="microcopy">Nutricionista</p>
        <h1>Planes nutricionales</h1>
        <p class="text-muted">Planes asociados únicamente a tus pacientes asignados.</p>
      </div>
    </header>

    <article class="bt-dashboard-panel">
      <DataTable
        :value="nutritionistStore.assignedPatients"
        :loading="nutritionistStore.loading"
        responsive-layout="scroll"
        data-key="id"
      >
        <Column field="name" header="Paciente" />
        <Column header="Plan">
          <template #body="{ data }">{{ data.plan?.name ?? 'Sin plan' }}</template>
        </Column>
        <Column header="Estado">
          <template #body="{ data }">
            <Tag :value="data.planStatus" :severity="statusSeverity(data.planStatus)" />
          </template>
        </Column>
        <Column header="Calorías">
          <template #body="{ data }">{{ data.dailyCalories ?? '-' }}</template>
        </Column>
        <Column header="Acción">
          <template #body="{ data }">
            <div class="bt-table-actions">
              <Button
                :label="data.plan ? 'Ver paciente' : 'Crear plan'"
                outlined
                @click="router.push(data.plan ? `/nutritionist-patients/${data.id}` : `/nutritionist-plans/create/${data.id}`)"
              />
              <Button
                v-if="data.plan && data.planStatus !== 'PROPOSED'"
                label="Proponer"
                text
                @click="changePlanStatus(data, 'PROPOSED')"
              />
              <Button
                v-if="data.plan && data.planStatus !== 'ACTIVATED'"
                label="Activar"
                text
                @click="changePlanStatus(data, 'ACTIVATED')"
              />
              <Button
                v-if="data.plan && data.planStatus !== 'REJECTED'"
                label="Rechazar"
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
