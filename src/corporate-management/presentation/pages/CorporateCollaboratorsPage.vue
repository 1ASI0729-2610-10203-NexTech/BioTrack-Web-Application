<script setup>
import { ref, computed, onMounted } from 'vue'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import { corporateCollaboratorApiService } from '../../infrastructure/corporate-collaborator-api.service'

const COMPANY_ID = 1

const collaborators = ref([])
const loading = ref(true)
const uploading = ref(false)
const uploadDone = ref(false)
const uploadError = ref('')
const fileInput = ref(null)
const selectedFile = ref(null)

const activeCount = computed(() => collaborators.value.filter((c) => c.status === 'ACTIVE').length)
const pendingCount = computed(() => collaborators.value.filter((c) => c.status === 'INVITED').length)

async function loadData() {
  loading.value = true
  try {
    collaborators.value = await corporateCollaboratorApiService.fetchCollaborators(COMPANY_ID)
  } finally {
    loading.value = false
  }
}

function handleFileChange(event) {
  selectedFile.value = event.target.files[0] ?? null
  uploadError.value = ''
}

async function handleUpload() {
  if (!selectedFile.value) return
  uploading.value = true
  uploadError.value = ''
  try {
    await corporateCollaboratorApiService.uploadCollaborators(COMPANY_ID, selectedFile.value)
    uploadDone.value = true
    selectedFile.value = null
    if (fileInput.value) fileInput.value.value = ''
    await loadData()
  } catch {
    uploadError.value = 'Error al cargar el archivo. Verifique el formato e intente nuevamente.'
  } finally {
    uploading.value = false
  }
}

function formatTime(isoString) {
  if (!isoString) return '—'
  return new Date(isoString).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
}

const getSeverity = (status) => (status === 'ACTIVE' ? 'success' : 'warning')
const getStatusLabel = (status) => (status === 'ACTIVE' ? 'Activo' : 'Pendiente aceptar')

onMounted(loadData)
</script>

<template>
  <section class="bt-corporate-dashboard">

    <header class="bt-dashboard-heading">
      <div>
        <p class="microcopy">ADMIN CORPORATIVO</p>
        <h1>Colaboradores</h1>
        <p class="text-muted">Carga el listado de colaboradores en formato CSV o Excel</p>
      </div>
      <div class="bt-progress-badge" :class="{ 'bt-progress-badge--done': uploadDone }">
        <span>{{ activeCount }}/{{ collaborators.length }}</span>
        <span v-if="uploadDone">✓</span>
      </div>
    </header>

    <p v-if="loading" class="text-muted">Cargando colaboradores...</p>

    <template v-else>

      <div v-if="uploadDone" class="bt-panel-note" style="border-radius: 8px; padding: 12px 16px; background: var(--bt-success-soft); border-color: var(--bt-success); margin-bottom: 20px;">
        ✓ <strong>Archivo cargado correctamente</strong> — Los colaboradores serán procesados e invitados.
      </div>

      <div v-if="uploadError" class="bt-panel-note" style="border-radius: 8px; padding: 12px 16px; background: #fee2e2; border-color: #ef4444; margin-bottom: 20px;">
        {{ uploadError }}
      </div>

      <section class="bt-kpi-grid mb-4">
        <article class="bt-kpi-card bt-kpi-card--primary">
          <span>Activos</span>
          <strong>{{ activeCount }}</strong>
        </article>
        <article class="bt-kpi-card">
          <span>Pendientes de aceptar</span>
          <strong>{{ pendingCount }}</strong>
        </article>
        <article class="bt-kpi-card">
          <span>Total cargados</span>
          <strong>{{ collaborators.length }}</strong>
        </article>
      </section>

      <article class="bt-dashboard-panel" style="margin-bottom: 24px;">
        <h3 style="margin: 0 0 16px; font-size: 1rem;">Cargar colaboradores</h3>
        <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
          <input
            ref="fileInput"
            type="file"
            accept=".csv,.xlsx,.xls"
            style="flex: 1; min-width: 200px;"
            @change="handleFileChange"
          />
          <Button
            :label="uploading ? 'Subiendo...' : 'Cargar archivo'"
            :disabled="uploading || !selectedFile"
            class="p-button-primary"
            @click="handleUpload"
          />
        </div>
        <p class="text-muted" style="margin: 8px 0 0; font-size: 0.8rem;">
          Formatos aceptados: CSV, Excel (.xlsx). Columnas requeridas: nombre, email.
        </p>
      </article>

      <div class="card mt-4">
        <DataTable :value="collaborators" responsiveLayout="scroll" :paginator="true" :rows="5" class="p-datatable-sm shadow-2 border-round">
          <Column field="name" header="COLABORADOR" :sortable="true"></Column>
          <Column field="email" header="EMAIL"></Column>
          <Column field="status" header="ESTADO">
            <template #body="slotProps">
              <Tag :value="getStatusLabel(slotProps.data.status)" :severity="getSeverity(slotProps.data.status)" />
            </template>
          </Column>
          <Column field="sentAt" header="ENVIADO">
            <template #body="slotProps">
              {{ slotProps.data.sentAt ? 'Hoy ' + formatTime(slotProps.data.sentAt) : '—' }}
            </template>
          </Column>
        </DataTable>
      </div>

    </template>
  </section>
</template>