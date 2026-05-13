<script setup>
import { ref } from 'vue'
import Button from 'primevue/button'
import { corporateRegisterApiService } from '../../infrastructure/corporate-register-api.service'

const form = ref({
  name: '',
  ruc: '',
  sector: '',
  country: '',
  city: '',
})

const submitted = ref(false)
const loading = ref(false)

async function handleSubmit() {
  loading.value = true
  try {
    await corporateRegisterApiService.registerCompany(form.value)
    submitted.value = true
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="bt-corporate-dashboard">

    <!-- Cabecera -->
    <header class="bt-dashboard-heading">
      <div>
        <p class="microcopy">US12 · ESCENARIO 1</p>
        <h1>Registrar empresa</h1>
        <p class="text-muted">Perfil corporativo creado</p>
      </div>
      <div
          class="bt-kpi-card"
          style="min-height: auto; padding: 12px 20px; border-radius: 999px; text-align: center; width: max-content;"
          :style="submitted
          ? 'background: var(--bt-success-soft); border-color: var(--bt-success);'
          : 'background: var(--bt-surface); border-color: var(--bt-border);'"
      >
        <span :style="submitted ? 'color: var(--bt-success-dark);' : 'color: var(--bt-text-muted);'">
          {{ submitted ? 'Creado ✓' : 'Pendiente' }}
        </span>
      </div>
    </header>

    <!-- Banner éxito -->
    <div
        v-if="submitted"
        class="bt-panel-note"
        style="border-radius: 8px; padding: 12px 16px; background: var(--bt-success-soft); border-color: var(--bt-success);"
    >
      ✓ <strong>Perfil corporativo creado</strong> — Procede a validar el RUC para completar la verificación.
    </div>

    <!-- Layout principal -->
    <div class="bt-form-with-side">

      <!-- Formulario -->
      <article class="bt-dashboard-panel" style="align-content: start;">
        <div class="bt-two-col-form">
          <label>
            Razón social
            <input
                v-model="form.name"
                class="p-inputtext"
                :class="{ 'bt-input-success': form.name }"
                placeholder="TechCorp S.A.C."
                :disabled="submitted"
            />
          </label>
          <label>
            RUC
            <input
                v-model="form.ruc"
                class="p-inputtext"
                :class="{ 'bt-input-success': form.ruc }"
                placeholder="20601234567"
                :disabled="submitted"
            />
          </label>
          <label>
            Sector
            <input
                v-model="form.sector"
                class="p-inputtext"
                :class="{ 'bt-input-success': form.sector }"
                placeholder="Tecnología"
                :disabled="submitted"
            />
          </label>
          <label>
            País
            <input
                v-model="form.country"
                class="p-inputtext"
                :class="{ 'bt-input-success': form.country }"
                placeholder="Perú"
                :disabled="submitted"
            />
          </label>
        </div>

        <label>
          Ciudad
          <input
              v-model="form.city"
              class="p-inputtext"
              :class="{ 'bt-input-success': form.city }"
              placeholder="Lima"
              :disabled="submitted"
          />
        </label>

        <p class="text-muted bt-small" style="margin: 0; padding: 12px 16px; background: var(--bt-primary-soft); border-radius: var(--radius-md);">
          Siguiente: validar el RUC mediante consulta fiscal automática.
        </p>

        <div v-if="!submitted">
          <Button
              :label="loading ? 'Registrando...' : 'Registrar empresa'"
              :disabled="loading"
              class="bt-dashboard-export"
              @click="handleSubmit"
          />
        </div>
      </article>

      <!-- Panel lateral -->
      <div style="display: grid; gap: 14px; align-content: start;">

        <!-- Estado -->
        <article class="bt-kpi-card bt-kpi-card--primary" style="min-height: auto;">
          <span>Estado</span>
          <strong>Pendiente verificación</strong>
        </article>

        <!-- Próximos pasos -->
        <article class="bt-dashboard-panel" style="padding: 24px;">
          <h3 style="margin: 0 0 16px;">Próximos pasos</h3>
          <ul class="bt-steps-list">
            <li>
              <strong>Empresa registrada</strong>
              <span>{{ submitted ? 'Completado ✓' : 'Pendiente' }}</span>
            </li>
            <li>
              <strong>Validar RUC</strong>
              <span>Pendiente</span>
            </li>
            <li>
              <strong>Subir colaboradores</strong>
              <span>Pendiente</span>
            </li>
          </ul>

          <Button
              label="Validar RUC →"
              :disabled="!submitted"
              class="bt-dashboard-export"
              style="width: 100%; margin-top: 20px;"
          />
        </article>

      </div>
    </div>

  </section>
</template>