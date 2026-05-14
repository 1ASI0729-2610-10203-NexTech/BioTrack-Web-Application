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
        <p class="microcopy">Nutricionista</p>
        <h1>Mis pacientes</h1>
        <p class="text-muted">Pacientes relacionados mediante asignación activa.</p>
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
        <Column field="age" header="Edad" />
        <Column header="Peso">
          <template #body="{ data }">{{ data.currentWeight ?? data.weightKg }} kg</template>
        </Column>
        <Column field="bmi" header="IMC" />
        <Column field="nutritionalGoalLabel" header="Objetivo" />
        <Column header="Perfil">
          <template #body="{ data }">
            <Tag :value="data.isComplete ? 'Completo' : 'Incompleto'" :severity="data.isComplete ? 'success' : 'warn'" />
          </template>
        </Column>
        <Column header="Plan">
          <template #body="{ data }">
            <Tag :value="data.planStatus" :severity="planSeverity(data.planStatus)" />
          </template>
        </Column>
        <Column header="Adherencia">
          <template #body="{ data }">{{ data.adherence.percentage }}%</template>
        </Column>
        <Column field="updatedAt" header="Última actualización" />
        <Column header="Acciones">
          <template #body="{ data }">
            <div class="bt-table-actions">
              <Button icon="pi pi-eye" text rounded aria-label="Ver detalle" @click="router.push(`/nutritionist-patients/${data.id}`)" />
              <Button icon="pi pi-clipboard" text rounded aria-label="Evaluar" @click="router.push(`/nutritionist-evaluations/${data.id}`)" />
              <Button icon="pi pi-plus" text rounded aria-label="Crear plan" @click="router.push(`/nutritionist-plans/create/${data.id}`)" />
              <Button icon="pi pi-comments" text rounded aria-label="Seguimiento" @click="router.push(`/nutritionist-follow-up/${data.id}`)" />
            </div>
          </template>
        </Column>
      </DataTable>
    </article>
  </section>
</template>
