<script setup>
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import Button from "primevue/button";
import Message from "primevue/message";
import ProgressBar from "primevue/progressbar";
import Tag from "primevue/tag";
import { usePatientProfileStore } from "../../application/patient-profile.store";

const { t } = useI18n();
const router = useRouter();
const profileStore = usePatientProfileStore();
const profile = computed(() => profileStore.profile);
const health = computed(() => profileStore.healthData);
const restrictionLabels = computed(() =>
  profileStore.dietaryRestrictions
    .map((restriction) => restriction.label)
    .join(", "),
);
const planReadinessItems = computed(() => [
  {
    label: t('profile.registerHealthData'),
    completed: profileStore.hasHealthData,
    route: "/patient-profile/health-data",
  },
  {
    label: t('profile.selectNutritionalGoal'),
    completed: profileStore.hasGoal,
    route: "/patient-profile/nutritional-goal",
  },
  {
    label: t('profile.confirmRestrictions'),
    completed: profileStore.hasRestrictionsConfirmed,
    route: "/patient-profile/restrictions",
  },
]);
const canContinueToPlan = computed(() => profileStore.isProfileComplete);

function formatWeight(value) {
  return value == null ? "--" : `${Number(value).toFixed(1)} kg`;
}

function goToNutritionalPlan() {
  if (!canContinueToPlan.value) return;
  router.push("/nutritional-plan");
}

onMounted(() => profileStore.fetchPatientProfile());
</script>

<template>
  <section class="bt-profile-page">
    <header class="bt-patient-heading">
      <div>
        <p class="microcopy">{{ t('profile.eyebrow') }}</p>
        <h1>
          {{ profile?.firstName ?? t('profile.defaultName') }} {{ profile?.lastName ?? "" }}
        </h1>
        <p class="text-muted">
          {{ t('profile.subtitle') }}
        </p>
      </div>
      <Tag
        :value="
          profileStore.isProfileComplete
            ? t('profile.profileComplete')
            : t('profile.profileIncomplete')
        "
        :severity="profileStore.isProfileComplete ? 'success' : 'warn'"
      />
    </header>

    <Message
      v-if="profileStore.isProfileComplete"
      severity="success"
      class="bt-profile-message"
    >
      <strong>{{ t('profile.completedTag') }}</strong>
      <span>
        {{ t('profile.completedEvent', { type: profileStore.profileCompletionEvent?.type, nutritionist: profile?.nutritionist ?? t('profile.pendingAssignment') }) }}
      </span>
    </Message>

    <section class="bt-profile-overview">
      <article class="bt-dashboard-panel">
        <div class="bt-panel-header">
          <h3>{{ t('profile.profileStatus') }}</h3>
          <strong>{{ profileStore.completionPercentage }}%</strong>
        </div>
        <ProgressBar :value="profileStore.completionPercentage" />
        <p class="text-muted">
          {{ t('profile.profileStatusSubtitle') }}
        </p>
      </article>
      <article class="bt-patient-card bt-patient-card--blue">
        <span>{{ t('profile.bmiCalculated') }}</span>
        <strong>{{ profileStore.bmiValue.toFixed(1) }}</strong>
        <small>{{ profileStore.bmiStatus }}</small>
      </article>
      <article class="bt-patient-card">
        <span>{{ t('profile.recommendedTargetWeight') }}</span>
        <strong>{{ formatWeight(profileStore.targetWeight) }}</strong>
        <small>{{ profileStore.goalLabel }}</small>
      </article>
    </section>

    <section class="bt-profile-grid">
      <article class="bt-dashboard-panel">
        <h3>{{ t('profile.healthData') }}</h3>
        <dl class="bt-data-list">
          <div>
            <dt>{{ t('profile.weight') }}</dt>
            <dd>{{ health?.weightKg ?? "--" }} kg</dd>
          </div>
          <div>
            <dt>{{ t('profile.initialWeight') }}</dt>
            <dd>{{ formatWeight(profileStore.initialWeight) }}</dd>
          </div>
          <div>
            <dt>{{ t('profile.currentWeight') }}</dt>
            <dd>{{ formatWeight(profileStore.currentWeight) }}</dd>
          </div>
          <div>
            <dt>{{ t('profile.height') }}</dt>
            <dd>{{ health?.heightCm ?? "--" }} cm</dd>
          </div>
          <div>
            <dt>{{ t('profile.age') }}</dt>
            <dd>{{ health?.age ?? "--" }}</dd>
          </div>
          <div>
            <dt>{{ t('profile.biologicalSex') }}</dt>
            <dd>{{ health?.biologicalSex?.value ?? "--" }}</dd>
          </div>
          <div>
            <dt>{{ t('profile.activityLevel') }}</dt>
            <dd>{{ health?.activityLevel?.value ?? "--" }}</dd>
          </div>
          <div>
            <dt>{{ t('profile.bloodPressure') }}</dt>
            <dd>
              {{ health?.bloodPressure?.systolic ?? "--" }}/{{
                health?.bloodPressure?.diastolic ?? "--"
              }}
            </dd>
          </div>
          <div>
            <dt>{{ t('profile.basalGlucose') }}</dt>
            <dd>{{ health?.glucoseMgDl ?? "--" }} mg/dL</dd>
          </div>
          <div>
            <dt>{{ t('profile.remainingToGoal') }}</dt>
            <dd>{{ formatWeight(profileStore.weightToGoal) }}</dd>
          </div>
        </dl>
        <Button
          :label="t('profile.editHealthData')"
          @click="router.push('/patient-profile/health-data')"
        />
      </article>

      <article class="bt-dashboard-panel">
        <h3>{{ t('profile.nutritionalPreferences') }}</h3>
        <dl class="bt-data-list">
          <div>
            <dt>{{ t('profile.goal') }}</dt>
            <dd>{{ profileStore.goalLabel }}</dd>
          </div>
          <div>
            <dt>{{ t('profile.recommendedGoal') }}</dt>
            <dd>{{ formatWeight(profileStore.targetWeight) }}</dd>
          </div>
          <div>
            <dt>{{ t('profile.restrictions') }}</dt>
            <dd>{{ restrictionLabels }}</dd>
          </div>
          <div>
            <dt>{{ t('profile.nutritionist') }}</dt>
            <dd>{{ profile?.nutritionist ?? t('profile.pending') }}</dd>
          </div>
        </dl>
        <Message severity="info" class="bt-profile-message">
          {{ profileStore.weightGoalMessage }}
        </Message>
        <div class="bt-profile-requirements">
          <h4>{{ t('profile.planConditions') }}</h4>
          <button
            v-for="item in planReadinessItems"
            :key="item.label"
            type="button"
            class="bt-requirement-row"
            :class="{ 'bt-requirement-row--done': item.completed }"
            @click="router.push(item.route)"
          >
            <i
              :class="item.completed ? 'pi pi-check-circle' : 'pi pi-circle'"
            />
            <span>{{ item.label }}</span>
          </button>
        </div>
        <div class="bt-inline-actions">
          <Button
            :label="t('profile.selectGoalButton')"
            outlined
            @click="router.push('/patient-profile/nutritional-goal')"
          />
          <Button
            :label="t('profile.registerRestrictionsButton')"
            outlined
            @click="router.push('/patient-profile/restrictions')"
          />
          <Button
            :label="t('profile.continueToNutritionalPlan')"
            :disabled="!canContinueToPlan"
            :title="
              canContinueToPlan
                ? t('profile.continueTitle')
                : t('profile.continueTitleDisabled')
            "
            @click="goToNutritionalPlan"
          />
        </div>
      </article>
    </section>
  </section>
</template>
