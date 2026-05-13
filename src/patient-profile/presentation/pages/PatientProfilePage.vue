<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Message from 'primevue/message'
import ProgressBar from 'primevue/progressbar'
import Tag from 'primevue/tag'
import { usePatientProfileStore } from '../../application/patient-profile.store'

const router = useRouter()
const profileStore = usePatientProfileStore()
const profile = computed(() => profileStore.profile)
const health = computed(() => profileStore.healthData)
const restrictionLabels = computed(() =>
  profileStore.dietaryRestrictions.map((restriction) => restriction.label).join(', '),
)
const planReadinessItems = computed(() => [
  {
    label: 'Registrar datos de salud validos',
    completed: profileStore.hasHealthData,
    route: '/patient-profile/health-data',
  },
  {
    label: 'Seleccionar objetivo nutricional',
    completed: profileStore.hasGoal,
    route: '/patient-profile/nutritional-goal',
  },
  {
    label: 'Confirmar restricciones alimentarias',
    completed: profileStore.hasRestrictionsConfirmed,
    route: '/patient-profile/restrictions',
  },
])
const canContinueToPlan = computed(() => profileStore.isProfileComplete)

function goToNutritionalPlan() {
  if (!canContinueToPlan.value) return
  router.push('/nutritional-plan')
}

onMounted(() => profileStore.fetchPatientProfile())
</script>

<template>
  <section class="bt-profile-page">
    <header class="bt-patient-heading">
      <div>
        <p class="microcopy">Perfil del paciente</p>
        <h1>{{ profile?.firstName ?? 'Paciente' }} {{ profile?.lastName ?? '' }}</h1>
        <p class="text-muted">Resumen clinico y estado de completitud del perfil.</p>
      </div>
      <Tag :value="profileStore.isProfileComplete ? 'Perfil completo' : 'Perfil incompleto'" :severity="profileStore.isProfileComplete ? 'success' : 'warn'" />
    </header>

    <Message v-if="profileStore.isProfileComplete" severity="success" class="bt-profile-message">
      <strong>Perfil completo</strong>
      <span>
        Evento mock {{ profileStore.profileCompletionEvent?.type }} emitido. Nutricionista asignada:
        {{ profile?.nutritionist ?? 'Pendiente de asignacion' }}.
      </span>
    </Message>

    <section class="bt-profile-overview">
      <article class="bt-dashboard-panel">
        <div class="bt-panel-header">
          <h3>Estado del perfil</h3>
          <strong>{{ profileStore.completionPercentage }}%</strong>
        </div>
        <ProgressBar :value="profileStore.completionPercentage" />
        <p class="text-muted">Datos de salud, objetivo y restricciones confirmadas.</p>
      </article>
      <article class="bt-patient-card bt-patient-card--blue">
        <span>IMC calculado</span>
        <strong>{{ profileStore.bmiValue.toFixed(2) }}</strong>
        <small>{{ profileStore.bmiStatus }}</small>
      </article>
      <article class="bt-patient-card">
        <span>Calorias recomendadas</span>
        <strong>{{ profileStore.getRecommendedCalories() }} kcal</strong>
        <small>Estimado segun objetivo</small>
      </article>
    </section>

    <section class="bt-profile-grid">
      <article class="bt-dashboard-panel">
        <h3>Datos de salud</h3>
        <dl class="bt-data-list">
          <div><dt>Peso</dt><dd>{{ health?.weightKg ?? '--' }} kg</dd></div>
          <div><dt>Talla</dt><dd>{{ health?.heightCm ?? '--' }} cm</dd></div>
          <div><dt>Edad</dt><dd>{{ health?.age ?? '--' }} anos</dd></div>
          <div><dt>Sexo biologico</dt><dd>{{ health?.biologicalSex?.value ?? '--' }}</dd></div>
          <div><dt>Nivel de actividad</dt><dd>{{ health?.activityLevel?.value ?? '--' }}</dd></div>
          <div><dt>Presion arterial</dt><dd>{{ health?.bloodPressure?.systolic ?? '--' }}/{{ health?.bloodPressure?.diastolic ?? '--' }}</dd></div>
          <div><dt>Glucosa basal</dt><dd>{{ health?.glucoseMgDl ?? '--' }} mg/dL</dd></div>
        </dl>
        <Button label="Editar datos de salud" @click="router.push('/patient-profile/health-data')" />
      </article>

      <article class="bt-dashboard-panel">
        <h3>Preferencias nutricionales</h3>
        <dl class="bt-data-list">
          <div><dt>Objetivo</dt><dd>{{ profileStore.goalLabel }}</dd></div>
          <div><dt>Restricciones</dt><dd>{{ restrictionLabels }}</dd></div>
          <div><dt>Nutricionista</dt><dd>{{ profile?.nutritionist ?? 'Pendiente' }}</dd></div>
        </dl>
        <div class="bt-profile-requirements">
          <h4>Condiciones para continuar al plan</h4>
          <button
            v-for="item in planReadinessItems"
            :key="item.label"
            type="button"
            class="bt-requirement-row"
            :class="{ 'bt-requirement-row--done': item.completed }"
            @click="router.push(item.route)"
          >
            <i :class="item.completed ? 'pi pi-check-circle' : 'pi pi-circle'" />
            <span>{{ item.label }}</span>
          </button>
        </div>
        <div class="bt-inline-actions">
          <Button label="Seleccionar objetivo" outlined @click="router.push('/patient-profile/nutritional-goal')" />
          <Button label="Registrar restricciones" outlined @click="router.push('/patient-profile/restrictions')" />
          <Button
            label="Continuar a Plan Nutricional"
            :disabled="!canContinueToPlan"
            :title="canContinueToPlan ? 'Continuar al plan nutricional' : 'Completa datos de salud, objetivo y restricciones para continuar'"
            @click="goToNutritionalPlan"
          />
        </div>
      </article>
    </section>
  </section>
</template>
