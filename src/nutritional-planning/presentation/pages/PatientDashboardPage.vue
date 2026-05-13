<script setup>
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import Button from "primevue/button";
import Message from "primevue/message";
import Tag from "primevue/tag";
import { useIdentityAccessStore } from "../../../identity-access/application/identity-access.store";
import { usePatientProfileStore } from "../../../patient-profile/application/patient-profile.store";
import { useSubscriptionsBillingStore } from "../../../subscriptions-billing/application/subscriptions-billing.store";
import { usePatientPlanStore } from "../../application/patient-plan.store";
import { usePatientProgressStore } from "../../../progress-tracking/application/patient-progress.store";

const router = useRouter();
const toast = useToast();
const identityAccessStore = useIdentityAccessStore();
const patientProfileStore = usePatientProfileStore();
const billingStore = useSubscriptionsBillingStore();
const patientPlanStore = usePatientPlanStore();
const patientProgressStore = usePatientProgressStore();

onMounted(async () => {
  await identityAccessStore.refreshCurrentUser();
  await patientProfileStore.fetchPatientProfile();
  await billingStore.fetchPlans();
  const plan = await patientPlanStore.fetchPatientPlan();
  patientProgressStore.setDailyCalories(plan?.dailyCalories ?? 0);
});

const planLabel = computed(() =>
  patientPlanStore.hasActivePlan
    ? "Activo"
    : patientPlanStore.hasProposedPlan
      ? "Propuesto"
      : "Sin plan",
);
const requiresEmailVerification = computed(
  () => !identityAccessStore.hasVerifiedAccount,
);
const profileIncomplete = computed(
  () => !patientProfileStore.isProfileComplete,
);
const hasNutritionSubscription = computed(() =>
  ["Profesional", "Premium"].includes(billingStore.activeSubscription?.planName),
);
const lockedPlanMessage = computed(() => {
  if (!identityAccessStore.hasVerifiedAccount) {
    return "Verifica tu correo para habilitar el flujo nutricional.";
  }
  if (!patientProfileStore.isProfileComplete) {
    return "Completa tu perfil de salud, objetivo nutricional y restricciones.";
  }
  if (!hasNutritionSubscription.value) {
    return "Contrata un plan Profesional o Premium para activar tu plan nutricional.";
  }
  return "Tu acceso nutricional está siendo sincronizado. Revisa nuevamente en unos segundos.";
});

async function verifyEmail() {
  await identityAccessStore.verifyEmail();
  toast.add({
    severity: "success",
    summary: "Correo verificado",
    detail: "Correo verificado correctamente",
    life: 3000,
  });
  await patientPlanStore.fetchPatientPlan();
}
</script>

<template>
  <section class="bt-patient-page">
    <header class="bt-patient-heading">
      <div>
        <p class="microcopy">Paciente</p>
        <h1>Dashboard paciente: {{ identityAccessStore.currentUser?.name }}</h1>
        <p class="text-muted">
          Resumen de tu progreso nutricional y accesos principales.
        </p>
      </div>
      <Tag :value="`Plan: ${planLabel}`" severity="info" />
    </header>

    <Message
      v-if="requiresEmailVerification"
      severity="warn"
      class="bt-verification-message"
    >
      <div class="bt-verification-content">
        <span
          >Tu correo aún no ha sido verificado. Verifica tu cuenta para acceder
          a todas las funcionalidades.</span
        >
        <Button
          label="Verificar correo"
          size="small"
          :loading="identityAccessStore.loading"
          @click="verifyEmail"
        />
      </div>
    </Message>
    <Message
      v-if="!requiresEmailVerification && profileIncomplete"
      severity="info"
      class="bt-verification-message"
    >
      Completa tus datos de salud, objetivo nutricional y restricciones para
      habilitar tu plan.
    </Message>

    <section class="bt-patient-summary-grid">
      <article
        class="bt-patient-card bt-patient-card--blue"
        v-if="patientPlanStore.hasActivePlan"
      >
        <span>Calorías restantes</span>
        <strong>{{
          patientPlanStore.currentPlan?.dailyCalories -
          patientProgressStore.dailyConsumedCalories
        }}</strong>
        <small>
          de {{ patientPlanStore.currentPlan?.dailyCalories ?? 0 }} kcal</small
        >
      </article>
      <article class="bt-patient-card">
        <span>Estado del plan</span>
        <strong>{{ planLabel }}</strong>
        <small>{{ patientPlanStore.nutritionist }}</small>
      </article>
      <article class="bt-patient-card">
        <span>Adherencia actual</span>
        <strong
          >{{ patientProgressStore.dailyAdherence.value.toFixed(0) }}%</strong
        >
        <small>Consumo de hoy</small>
      </article>
      <article class="bt-patient-card">
        <span>Perfil de salud</span>
        <strong>{{
          patientProfileStore.isProfileComplete ? "Completado" : "Pendiente"
        }}</strong>
        <small>{{
          patientProfileStore.isProfileComplete
            ? "Listo para plan nutricional"
            : "Completa el perfil para continuar"
        }}</small>
      </article>
    </section>

    <section v-if="!patientPlanStore.hasActivePlan" class="bt-lock-card">
      <div>
        <p class="microcopy">Seguimiento bloqueado</p>
        <h2>Aun no tienes un plan nutricional activo.</h2>
        <p class="text-muted">
          {{ lockedPlanMessage }}
        </p>
      </div>
      <Button
        label="Ver plan nutricional"
        @click="router.push('/nutritional-plan')"
      />
      <Button
        v-if="identityAccessStore.hasVerifiedAccount && patientProfileStore.isProfileComplete && !hasNutritionSubscription"
        label="Ir a Facturación"
        outlined
        @click="router.push('/subscriptions-billing')"
      />
    </section>

    <section class="bt-quick-actions">
      <Button
        label="Registrar comida"
        icon="pi pi-plus"
        :disabled="!patientPlanStore.hasActivePlan"
        @click="router.push('/food-log')"
      />
      <Button
        label="Ver plan nutricional"
        outlined
        @click="router.push('/nutritional-plan')"
      />
      <Button
        label="Ir a facturacion"
        outlined
        @click="router.push('/subscriptions-billing')"
      />
    </section>
  </section>
</template>
