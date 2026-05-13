<script setup>
import { computed, onMounted, ref } from 'vue'
import ProgressCard from '../components/progress-card.vue'
import ProgressAlert from '../components/progress-alert.vue'
import ActivityWeekStrip from '../components/activity-week-strip.vue'
import { loadActivityRecord, registerActivity } from '../../application/use-cases/register-activity.use-case.js'

const activityName = ref('')
const intensity = ref('')
const duration = ref('')
const burnedCalories = ref(0)
const notes = ref('')
const formattedDate = ref('')
const weekActivity = ref([])

const caloriesDisplay = computed(() => `~${Math.round(burnedCalories.value)} kcal`)

const caloriesHeadline = computed(() => `~${Math.round(burnedCalories.value)}`)

function hydrateFromRecord(record) {
  activityName.value = record.activityName || record.type
  intensity.value = record.intensity
  duration.value = record.durationLabel || `${record.durationMinutes} minutos`
  burnedCalories.value = record.burnedCalories
  notes.value = record.notes
}

onMounted(async () => {
  const payload = await loadActivityRecord()
  hydrateFromRecord(payload.record)
  formattedDate.value = payload.formattedDate
  weekActivity.value = payload.weekActivity
})

async function handleSave() {
  const payload = await registerActivity({
    activityName: activityName.value,
    intensity: intensity.value,
    duration: duration.value,
    burnedCalories: burnedCalories.value,
    notes: notes.value,
  })
  hydrateFromRecord(payload.record)
  formattedDate.value = payload.formattedDate
  weekActivity.value = payload.weekActivity
}
</script>

<template>
  <div>
    <header class="pt-page-header">
      <div>
        <p class="pt-eyebrow pt-eyebrow--accent">US28 · Escenario 1</p>
        <h1 class="pt-title">Registro de actividad</h1>
        <p class="pt-subtitle">{{ formattedDate }}</p>
      </div>
      <span class="pt-badge pt-badge--success pt-badge--circle">✓ Guardado</span>
    </header>

    <ProgressAlert
      message="✓ Actividad registrada — Gasto calórico considerado en el cálculo de adherencia."
      class="pt-alert-space"
    />

    <div class="pt-grid-12">
      <div class="pt-span-6">
        <ProgressCard>
          <div class="pt-form-stack">
            <div>
              <label class="pt-form-label" for="field-activity">Actividad</label>
              <input id="field-activity" v-model="activityName" class="pt-input" type="text" autocomplete="off" />
            </div>
            <div>
              <label class="pt-form-label" for="field-intensity">Intensidad</label>
              <input id="field-intensity" v-model="intensity" class="pt-input" type="text" autocomplete="off" />
            </div>
            <div class="pt-form-row">
              <div class="pt-form-field">
                <label class="pt-form-label" for="field-duration">Duración</label>
                <input id="field-duration" v-model="duration" class="pt-input" type="text" autocomplete="off" />
              </div>
              <div class="pt-form-field">
                <label class="pt-form-label" for="field-calories">Calorías quemadas</label>
                <input
                  id="field-calories"
                  :value="caloriesDisplay"
                  class="pt-input"
                  type="text"
                  readonly
                  tabindex="0"
                  aria-readonly="true"
                />
              </div>
            </div>

            <div>
              <label class="pt-form-label" for="field-notes">Notas</label>
              <textarea id="field-notes" v-model="notes" class="pt-input pt-textarea" rows="3" />
            </div>

            <button type="button" class="pt-btn pt-btn--primary pt-save-btn" aria-label="Guardar actividad" @click="handleSave">
              Guardar actividad
            </button>
          </div>
        </ProgressCard>
      </div>

      <div class="pt-span-6 pt-stack">
        <div class="pt-panel-green">
          <p class="pt-panel-green__label">Calorías quemadas</p>
          <p class="pt-panel-green__value">{{ caloriesHeadline }}</p>
          <p class="pt-panel-green__hint">kcal estimadas</p>
        </div>

        <ActivityWeekStrip title="Esta semana" variant="blocks" :active-flags="weekActivity" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.pt-form-stack {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.pt-alert-space {
  margin-bottom: 1rem;
}

.pt-textarea {
  min-height: 5rem;
  resize: vertical;
  padding-top: 0.75rem;
}

.pt-save-btn {
  margin-top: 0.25rem;
  width: 100%;
}

.pt-stack {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.pt-form-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

@media (max-width: 40rem) {
  .pt-form-row {
    grid-template-columns: 1fr;
  }
}
</style>
