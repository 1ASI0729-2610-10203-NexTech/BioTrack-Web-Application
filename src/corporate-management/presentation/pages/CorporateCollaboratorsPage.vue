<script setup>
import { ref, computed, onMounted } from 'vue'
import Button from 'primevue/button'
import { corporateCollaboratorApiService } from '../../infrastructure/corporate-collaborator-api.service'

const collaborators = ref([])
const loading = ref(true)
const sending = ref(false)
const sent = ref(false)

const sentCount = computed(() => collaborators.value.filter((c) => c.status === 'INVITED').length)
const errorCount = computed(() => 0)
const remainingLicenses = computed(() => 50 - collaborators.value.length)

async function loadCollaborators() {
  loading.value = true
  try {
    collaborators.value = await corporateCollaboratorApiService.fetchCollaborators()
  } finally {
    loading.value = false
  }
}

async function handleSendInvitations() {
  sending.value = true
  try {
    collaborators.value = await corporateCollaboratorApiService.sendInvitations()
    sent.value = true
  } finally {
    sending.value = false
  }
}

function formatTime(isoString) {
  if (!isoString) return '—'
  return new Date(isoString).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
}

onMounted(loadCollaborators)
</script>

<template>
  <section class="bt-corporate-dashboard">

    <header class="bt-dashboard-heading">
      <div>
        <p class="microcopy">US15 · ESCENARIO 1</p>
        <h1>Envío de invitaciones</h1>
        <p class="text-muted">Correos enviados a todos los colaboradores</p>
      </div>
      <div class="bt-progress-badge" :class="{ 'bt-progress-badge--done': sent }">
        <span>{{ sentCount }}/{{ collaborators.length }}</span>
        <span v-if="sent">✓</span>
      </div>
    </header>

    <p v-if="loading" class="text-muted">Cargando colaboradores...</p>

    <template v-else>

      <div v-if="sent" class="bt-panel-note" style="border-radius: 8px; padding: 12px 16px; background: var(--bt-success-soft); border-color: var(--bt-success);">
        ✓ <strong>{{ sentCount }} invitaciones enviadas</strong> — Cada colaborador recibirá sus credenciales de acceso.
      </div>

      <section class="bt-kpi-grid">
        <article class="bt-kpi-card bt-kpi-card--primary">
          <span>Enviadas OK</span>
          <strong>{{ sentCount }}</strong>
        </article>
        <article class="bt-kpi-card">
          <span>Pendientes de aceptar</span>
          <strong>{{ sentCount }}</strong>
        </article>
        <article class="bt-kpi-card">
          <span>Con error</span>
          <strong style="color: var(--bt-danger)">{{ errorCount }}</strong>
        </article>
        <article class="bt-kpi-card">
          <span>Licencias restantes</span>
          <strong>{{ remainingLicenses }}</strong>
        </article>
      </section>

      <div v-if="!sent">
        <Button
            :label="sending ? 'Enviando...' : `Enviar invitaciones a todos (${collaborators.length})`"
            :disabled="sending"
            class="bt-dashboard-export"
            @click="handleSendInvitations"
        />
      </div>

      <div class="bt-dashboard-panel" style="padding: 0; overflow: hidden;">
        <table style="width: 100%; border-collapse: collapse; font-size: 0.875rem;">
          <thead>
          <tr style="background: var(--bt-surface);">
            <th style="padding: 12px 20px; text-align: left; font-size: 0.75rem; color: var(--bt-text-muted); font-weight: 600; letter-spacing: 0.05em;">COLABORADOR</th>
            <th style="padding: 12px 20px; text-align: left; font-size: 0.75rem; color: var(--bt-text-muted); font-weight: 600; letter-spacing: 0.05em;">EMAIL</th>
            <th style="padding: 12px 20px; text-align: left; font-size: 0.75rem; color: var(--bt-text-muted); font-weight: 600; letter-spacing: 0.05em;">ESTADO</th>
            <th style="padding: 12px 20px; text-align: left; font-size: 0.75rem; color: var(--bt-text-muted); font-weight: 600; letter-spacing: 0.05em;">ENVIADO</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="collaborator in collaborators" :key="collaborator.id" style="border-top: 1px solid var(--bt-border);">
            <td style="padding: 12px 20px; font-weight: 600; color: var(--bt-text);">{{ collaborator.name }}</td>
            <td style="padding: 12px 20px; color: var(--bt-text-muted);">{{ collaborator.email }}</td>
            <td style="padding: 12px 20px;">
                <span
                    style="display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 0.78rem; font-weight: 500;"
                    :style="collaborator.status === 'INVITED'
                    ? 'background: #fef9c3; color: #92400e;'
                    : 'background: var(--bt-success-soft); color: var(--bt-success-dark);'"
                >
                  {{ collaborator.status === 'INVITED' ? 'Pendiente aceptar' : 'Activo' }}
                </span>
            </td>
            <td style="padding: 12px 20px; color: var(--bt-text-muted); font-size: 0.8rem;">
              {{ collaborator.sentAt ? 'Hoy ' + formatTime(collaborator.sentAt) : '—' }}
            </td>
          </tr>
          </tbody>
        </table>
      </div>

    </template>
  </section>
</template>