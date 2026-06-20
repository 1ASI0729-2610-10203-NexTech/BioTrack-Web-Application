<script setup>
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useToast } from "primevue/usetoast";
import Button from "primevue/button";
import Message from "primevue/message";
import Tag from "primevue/tag";
import { useIdentityAccessStore } from "../../../identity-access/application/identity-access.store";
import { usePatientProfileStore } from "../../../patient-profile/application/patient-profile.store";
import { useSubscriptionsBillingStore } from "../../../subscriptions-billing/application/subscriptions-billing.store";
import { usePatientPlanStore } from "../../application/patient-plan.store";
import { usePatientProgressStore } from "../../../progress-tracking/application/patient-progress.store";

const { t } = useI18n();
const router = useRouter();
const toast = useToast();
const identityAccessStore = useIdentityAccessStore();
const patientProfileStore = usePatientProfileStore();
const billingStore = useSubscriptionsBillingStore();
const patientPlanStore = usePatientPlanStore();
const patientProgressStore = usePatientProgressStore();

onMounted(async () => {
  const [, , , plan] = await Promise.all([
    identityAccessStore.refreshCurrentUser(),
    patientProfileStore.fetchPatientProfile(),
    billingStore.fetchPlans(),
    patientPlanStore.fetchPatientPlan(),
  ]);
  patientProgressStore.setDailyCalories(plan?.dailyCalories ?? 0);
});

const planLabel = computed(() =>
  patientPlanStore.hasActivePlan
    ? t('patient.dashboard.planActive')
    : patientPlanStore.hasProposedPlan
      ? t('patient.dashboard.planProposed')
      : t('patient.dashboard.planNone'),
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
    return t('patient.dashboard.lockedVerifyEmail');
  }
  if (!patientProfileStore.isProfileComplete) {
    return t('patient.dashboard.lockedCompleteProfile');
  }
  if (!hasNutritionSubscription.value) {
    return t('patient.dashboard.lockedSubscription');
  }
  return t('patient.dashboard.lockedSyncing');
});

async function verifyEmail() {
  await identityAccessStore.verifyEmail();
  toast.add({
    severity: "success",
    summary: t('patient.dashboard.emailVerified'),
    detail: t('patient.dashboard.emailVerifiedDetail'),
    life: 3000,
  });
  await patientPlanStore.fetchPatientPlan();
}
</script>

<template>
  <section class="bt-patient-page">
    <header class="bt-patient-heading">
      <div>
        <p class="microcopy">{{ t('patient.dashboard.eyebrow') }}</p>
        <h1>{{ t('patient.dashboard.title', { name: identityAccessStore.currentUser?.name }) }}</h1>
        <p class="text-muted">
          {{ t('patient.dashboard.subtitle') }}
        </p>
      </div>
      <Tag :value="t('patient.dashboard.planLabel', { label: planLabel })" severity="info" />
    </header>

    <Message
      v-if="requiresEmailVerification"
      severity="warn"
      class="bt-verification-message"
    >
      <div class="bt-verification-content">
        <span>{{ t('patient.dashboard.verifyEmailWarning') }}</span>
        <Button
          :label="t('patient.dashboard.verifyEmailButton')"
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
      {{ t('patient.dashboard.completeProfileInfo') }}
    </Message>

    <section class="bt-patient-summary-grid">
      <article
        class="bt-patient-card bt-patient-card--blue"
        v-if="patientPlanStore.hasActivePlan"
      >
        <span>{{ t('patient.dashboard.remainingCalories') }}</span>
        <strong>{{
          patientPlanStore.currentPlan?.dailyCalories -
          patientProgressStore.dailyConsumedCalories
        }}</strong>
        <small>{{ t('patient.dashboard.ofKcal', { kcal: patientPlanStore.currentPlan?.dailyCalories ?? 0 }) }}</small>
      </article>
      <article class="bt-patient-card">
        <span>{{ t('patient.dashboard.planStatus') }}</span>
        <strong>{{ planLabel }}</strong>
        <small>{{ patientPlanStore.nutritionist }}</small>
      </article>
      <article class="bt-patient-card">
        <span>{{ t('patient.dashboard.currentAdherence') }}</span>
        <strong
          >{{ patientProgressStore.dailyAdherence.value.toFixed(0) }}%</strong
        >
        <small>{{ t('patient.dashboard.todayConsumption') }}</small>
      </article>
      <article class="bt-patient-card">
        <span>{{ t('patient.dashboard.healthProfile') }}</span>
        <strong>{{
          patientProfileStore.isProfileComplete ? t('patient.dashboard.profileComplete') : t('patient.dashboard.profilePending')
        }}</strong>
        <small>{{
          patientProfileStore.isProfileComplete
            ? t('patient.dashboard.profileReadyForPlan')
            : t('patient.dashboard.profileCompleteToGo')
        }}</small>
      </article>
    </section>

    <section v-if="!patientPlanStore.hasActivePlan" class="bt-lock-card">
      <div>
        <p class="microcopy">{{ t('patient.dashboard.trackingBlocked') }}</p>
        <h2>{{ t('patient.dashboard.noActivePlan') }}</h2>
        <p class="text-muted">
          {{ lockedPlanMessage }}
        </p>
      </div>
      <Button
        :label="t('patient.dashboard.viewNutritionalPlan')"
        @click="router.push('/nutritional-plan')"
      />
      <Button
        v-if="identityAccessStore.hasVerifiedAccount && patientProfileStore.isProfileComplete && !hasNutritionSubscription"
        :label="t('patient.dashboard.goToBilling')"
        outlined
        @click="router.push('/subscriptions-billing')"
      />
    </section>

    <section class="bt-quick-actions">
      <Button
        :label="t('patient.dashboard.logFood')"
        icon="pi pi-plus"
        :disabled="!patientPlanStore.hasActivePlan"
        @click="router.push('/food-log')"
      />
      <Button
        :label="t('patient.dashboard.viewNutritionalPlan')"
        outlined
        @click="router.push('/nutritional-plan')"
      />
      <Button
        :label="t('patient.dashboard.goToBilling')"
        outlined
        @click="router.push('/subscriptions-billing')"
      />
    </section>
  </section>
</template>
