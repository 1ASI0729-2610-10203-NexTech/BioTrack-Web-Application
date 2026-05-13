<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import Message from 'primevue/message'
import Tag from 'primevue/tag'
import { useIdentityAccessStore } from '../../../identity-access/application/identity-access.store'
import { usePatientPlanStore } from '../../application/patient-plan.store'
import { usePatientProgressStore } from '../../../progress-tracking/application/patient-progress.store'

const router = useRouter()
const toast = useToast()
const identityAccessStore = useIdentityAccessStore()
const patientPlanStore = usePatientPlanStore()
const patientProgressStore = usePatientProgressStore()

onMounted(async () => {
  await identityAccessStore.refreshCurrentUser()
  const plan = await patientPlanStore.fetchPatientPlan()
  patientProgressStore.setDailyTargetCalories(plan?.targetCalories ?? 1850)
})

const planLabel = computed(() =>
  patientPlanStore.hasActivePlan
    ? 'Activo'
    : patientPlanStore.hasProposedPlan
      ? 'Propuesto'
      : 'Sin plan',
)
const requiresEmailVerification = computed(() => !identityAccessStore.hasVerifiedAccount)

async function verifyEmail() {
  await identityAccessStore.verifyEmail()
  toast.add({
    severity: 'success',
    summary: 'Correo verificado',
    detail: 'Correo verificado correctamente',
    life: 3000,
  })
  await patientPlanStore.fetchPatientPlan()
}
</script>

<template>
  <section class="bt-patient-page">
    <header class="bt-patient-heading">
      <div>
        <p class="microcopy">Paciente</p>
        <h1>Dashboard paciente</h1>
        <p class="text-muted">Resumen de tu progreso nutricional y accesos principales.</p>
      </div>
      <Tag :value="`Plan: ${planLabel}`" severity="info" />
    </header>

    <Message v-if="requiresEmailVerification" severity="warn" class="bt-verification-message">
      <div class="bt-verification-content">
        <span>Tu correo aún no ha sido verificado. Verifica tu cuenta para acceder a todas las funcionalidades.</span>
        <Button
          label="Verificar correo"
          size="small"
          :loading="identityAccessStore.loading"
          @click="verifyEmail"
        />
      </div>
    </Message>

    <section class="bt-patient-summary-grid">
      <article class="bt-patient-card">
        <span>Perfil de salud</span>
        <strong>Completado</strong>
        <small>Listo para plan nutricional</small>
      </article>
      <article class="bt-patient-card">
        <span>Estado del plan</span>
        <strong>{{ planLabel }}</strong>
        <small>{{ patientPlanStore.nutritionist }}</small>
      </article>
      <article class="bt-patient-card bt-patient-card--blue">
        <span>Calorias objetivo</span>
        <strong>{{ patientPlanStore.currentPlan?.targetCalories ?? 0 }} kcal</strong>
        <small>Meta diaria</small>
      </article>
      <article class="bt-patient-card">
        <span>Adherencia actual</span>
        <strong>{{ patientProgressStore.dailyAdherence.value.toFixed(0) }}%</strong>
        <small>Consumo de hoy</small>
      </article>
    </section>

    <section v-if="!patientPlanStore.hasActivePlan" class="bt-lock-card">
      <div>
        <p class="microcopy">Seguimiento bloqueado</p>
        <h2>Aun no tienes un plan nutricional activo.</h2>
        <p class="text-muted">
          Tu plan esta en revision. Cuando se active podras registrar alimentos y revisar tu dieta semanal.
        </p>
      </div>
      <Button label="Ver plan nutricional" @click="router.push('/nutritional-plan')" />
    </section>

    <section class="bt-quick-actions">
      <Button label="Registrar comida" icon="pi pi-plus" @click="router.push('/food-log')" />
      <Button label="Ver plan nutricional" outlined @click="router.push('/nutritional-plan')" />
      <Button label="Ir a facturacion" outlined @click="router.push('/subscriptions-billing')" />
    </section>
  </section>
</template>
