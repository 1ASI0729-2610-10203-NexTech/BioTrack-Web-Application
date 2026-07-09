<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import Message from 'primevue/message'
import Tag from 'primevue/tag'
import { useIdentityAccessStore } from '../../../identity-access/application/identity-access.store'
import { usePatientProfileStore } from '../../../patient-profile/application/patient-profile.store'
import { useSubscriptionsBillingStore } from '../../../subscriptions-billing/application/subscriptions-billing.store'
import { usePatientPlanStore } from '../../application/patient-plan.store'
import { usePatientProgressStore } from '../../../progress-tracking/application/patient-progress.store'

const { t } = useI18n()
const router = useRouter()
const identityAccessStore = useIdentityAccessStore()
const patientProfileStore = usePatientProfileStore()
const billingStore = useSubscriptionsBillingStore()
const patientPlanStore = usePatientPlanStore()
const patientProgressStore = usePatientProgressStore()

onMounted(async () => {
  await identityAccessStore.refreshCurrentUser()
  await patientProfileStore.fetchPatientProfile()
  await billingStore.fetchPlans()
  const plan = await patientPlanStore.fetchPatientPlan()
  patientProgressStore.setDailyCalories(plan?.dailyCalories ?? 0)
})

const plan = computed(() => patientPlanStore.currentPlan)
const hasNutritionSubscription = computed(() =>
  ['basic', 'premium'].includes(billingStore.activeSubscription?.planId),
)

async function acceptPlan() {
  await patientPlanStore.acceptPlan()
}
</script>

<template>
  <section class="bt-plan-page">
    <header class="bt-patient-heading">
      <div>
        <p class="microcopy">{{ t('patient.plan.eyebrow') }}</p>
        <h1>
          {{
            patientPlanStore.hasProposedPlan
              ? t('patient.plan.titleProposed')
              : patientPlanStore.hasActivePlan
                ? t('patient.plan.titleActive')
                : patientPlanStore.hasRejectedPlan
                  ? t('patient.plan.titleRejected')
                  : t('patient.plan.titleDefault')
          }}
        </h1>
        <p class="text-muted">
          {{
            patientPlanStore.hasProposedPlan
              ? t('patient.plan.subtitleProposed')
              : patientPlanStore.hasActivePlan
                ? t('patient.plan.subtitleActive')
                : patientPlanStore.hasRejectedPlan
                  ? t('patient.plan.subtitleRejected')
                  : t('patient.plan.subtitleDefault')
          }}
        </p>
      </div>
      <Tag
        v-if="patientPlanStore.hasProposedPlan || patientPlanStore.hasActivePlan || patientPlanStore.hasRejectedPlan"
        :value="patientPlanStore.hasActivePlan ? t('patient.plan.tagActive') : patientPlanStore.hasRejectedPlan ? t('patient.plan.tagRejected') : t('patient.plan.tagProposed')"
        :severity="patientPlanStore.hasActivePlan ? 'success' : patientPlanStore.hasRejectedPlan ? 'danger' : 'warn'"
      />
    </header>

    <section v-if="patientPlanStore.hasProposedPlan || patientPlanStore.hasActivePlan" class="bt-plan-grid">
      <article class="bt-dashboard-panel bt-plan-main-card">
        <div class="bt-panel-header">
          <div>
            <h3>{{ plan?.title }}</h3>
            <p class="text-muted">{{ t('patient.plan.elaboratedBy', { nutritionist: plan?.nutritionist, date: plan?.date }) }}</p>
          </div>
        </div>

        <div class="bt-plan-preview">
          <span>☀️ Avena + fruta</span>
          <span>🍽️ Pollo + arroz</span>
          <span>🌙 Ensalada</span>
        </div>

        <Message v-if="patientPlanStore.acceptedRecently" severity="success" class="bt-plan-message">
          <strong>{{ t('patient.plan.acceptedSuccess') }}</strong>
          <span>{{ t('patient.plan.acceptedSuccessDetail') }}</span>
        </Message>

        <div v-if="patientPlanStore.hasProposedPlan" class="bt-plan-actions">
          <Button :label="t('patient.plan.acceptPlan')" :loading="patientPlanStore.loading" @click="acceptPlan" />
          <Button :label="t('patient.plan.rejectPlan')" outlined @click="patientPlanStore.rejectPlan()" />
        </div>
      </article>

      <aside class="bt-plan-side">
        <article class="bt-plan-highlight">
          <span>{{ t('patient.plan.dailyCalories') }}</span>
          <strong>{{ plan?.dailyCalories }} kcal</strong>
          <small>{{ t('patient.plan.goal', { goal: plan?.goal }) }}</small>
        </article>

        <article class="bt-dashboard-panel">
          <h3>{{ t('patient.plan.macronutrients') }}</h3>
          <div class="bt-macro-row"><span>{{ t('patient.plan.proteins') }}</span><strong>{{ plan?.macros.proteins }}%</strong></div>
          <div class="bt-goal-track bt-goal-track--blue"><span /></div>
          <div class="bt-macro-row"><span>{{ t('patient.plan.carbohydrates') }}</span><strong>{{ plan?.macros.carbohydrates }}%</strong></div>
          <div class="bt-goal-track bt-goal-track--green"><span /></div>
          <div class="bt-macro-row"><span>{{ t('patient.plan.fats') }}</span><strong>{{ plan?.macros.fats }}%</strong></div>
          <div class="bt-goal-track bt-goal-track--warning"><span /></div>
        </article>

        <Button
          v-if="patientPlanStore.hasActivePlan"
          :label="t('patient.plan.viewWeeklyDiet')"
          @click="router.push('/weekly-diet')"
        />
      </aside>
    </section>

    <section v-else-if="patientPlanStore.hasRejectedPlan" class="bt-empty-plan-layout">
      <article class="bt-empty-plan-card">
        <div class="bt-empty-icon">!</div>
        <h2>{{ t('patient.plan.rejectedTitle') }}</h2>
        <p>{{ t('patient.plan.rejectedBody') }}</p>
      </article>
    </section>

    <section v-else class="bt-empty-plan-layout">
      <article class="bt-empty-plan-card">
        <div class="bt-empty-icon">✓</div>
        <h2>{{ t('patient.plan.noActivePlanTitle') }}</h2>
        <p>{{ t('patient.plan.noActivePlanBody') }}</p>
        <p v-if="!identityAccessStore.hasVerifiedAccount">
          {{ t('patient.plan.needsEmailVerification') }}
        </p>
        <p v-else-if="!patientProfileStore.isProfileComplete">
          {{ t('patient.plan.needsCompleteProfile') }}
        </p>
        <p v-else-if="!hasNutritionSubscription">
          {{ t('patient.plan.needsSubscription') }}
        </p>
        <p v-else>
          {{ t('patient.plan.subscriptionActive') }}
        </p>
        <Button :label="t('patient.plan.completeProfile')" @click="router.push('/patient-profile')" />
        <Button
          v-if="identityAccessStore.hasVerifiedAccount && patientProfileStore.isProfileComplete && !hasNutritionSubscription"
          :label="t('patient.plan.goToBilling')"
          outlined
          @click="router.push('/subscriptions-billing')"
        />
      </article>
    </section>
  </section>
</template>
