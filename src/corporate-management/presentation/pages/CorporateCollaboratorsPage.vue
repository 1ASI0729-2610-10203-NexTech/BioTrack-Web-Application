<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import { corporateCollaboratorApiService } from '../../infrastructure/corporate-collaborator-api.service'

const { locale, t } = useI18n()
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

function openFilePicker() {
  fileInput.value?.click()
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
    uploadError.value = t('corporate.collaborators.uploadError')
  } finally {
    uploading.value = false
  }
}

function formatTime(isoString) {
  if (!isoString) return '—'
  return new Date(isoString).toLocaleTimeString(locale.value === 'es-419' ? 'es-PE' : 'en-US', { hour: '2-digit', minute: '2-digit' })
}

const getSeverity = (status) => (status === 'ACTIVE' ? 'success' : 'warning')
const getStatusLabel = (status) => (status === 'ACTIVE' ? t('corporate.collaborators.statusActive') : t('corporate.collaborators.statusPending'))

onMounted(loadData)
</script>

<template>
  <section class="bt-corporate-dashboard">

    <header class="bt-dashboard-heading">
      <div>
        <p class="microcopy">{{ t('corporate.collaborators.eyebrow') }}</p>
        <h1>{{ t('corporate.collaborators.title') }}</h1>
        <p class="text-muted">{{ t('corporate.collaborators.subtitle') }}</p>
      </div>
      <div class="bt-progress-badge" :class="{ 'bt-progress-badge--done': uploadDone }">
        <span>{{ activeCount }}/{{ collaborators.length }}</span>
        <span v-if="uploadDone">✓</span>
      </div>
    </header>

    <p v-if="loading" class="text-muted">{{ t('corporate.collaborators.loading') }}</p>

    <template v-else>

      <div v-if="uploadDone" class="bt-panel-note" style="border-radius: 8px; padding: 12px 16px; background: var(--bt-success-soft); border-color: var(--bt-success); margin-bottom: 20px;">
        ✓ <strong>{{ t('corporate.collaborators.uploadSuccess') }}</strong>
      </div>

      <div v-if="uploadError" class="bt-panel-note" style="border-radius: 8px; padding: 12px 16px; background: #fee2e2; border-color: #ef4444; margin-bottom: 20px;">
        {{ uploadError }}
      </div>

      <section class="bt-kpi-grid mb-4">
        <article class="bt-kpi-card bt-kpi-card--primary">
          <span>{{ t('corporate.collaborators.active') }}</span>
          <strong>{{ activeCount }}</strong>
        </article>
        <article class="bt-kpi-card">
          <span>{{ t('corporate.collaborators.pendingAccept') }}</span>
          <strong>{{ pendingCount }}</strong>
        </article>
        <article class="bt-kpi-card">
          <span>{{ t('corporate.collaborators.totalLoaded') }}</span>
          <strong>{{ collaborators.length }}</strong>
        </article>
      </section>

      <article class="bt-dashboard-panel" style="margin-bottom: 24px;">
        <h3 style="margin: 0 0 16px; font-size: 1rem;">{{ t('corporate.collaborators.uploadSection') }}</h3>
        <div class="bt-upload-actions">
          <input
            ref="fileInput"
            type="file"
            accept=".csv,.xlsx,.xls"
            class="bt-file-input"
            :aria-label="t('corporate.collaborators.fileInputLabel')"
            @change="handleFileChange"
          />
          <button
            type="button"
            class="bt-file-picker"
            :disabled="uploading"
            @click="openFilePicker"
          >
            <span class="bt-file-picker__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <path d="M12 3v12m0-12 4 4m-4-4-4 4" />
                <path d="M5 15v3a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-3" />
              </svg>
            </span>
            <span class="bt-file-picker__text">
              <strong>{{ selectedFile ? selectedFile.name : t('corporate.collaborators.noFileSelected') }}</strong>
              <small>{{ t('corporate.collaborators.chooseFile') }}</small>
            </span>
          </button>
          <Button
            icon="pi pi-upload"
            :loading="uploading"
            :aria-label="t('corporate.collaborators.uploadFileLabel')"
            :disabled="uploading || !selectedFile"
            class="p-button-primary bt-upload-icon-button"
            @click="handleUpload"
          />
        </div>
        <p class="text-muted" style="margin: 8px 0 0; font-size: 0.8rem;">
          {{ t('corporate.collaborators.acceptedFormats') }}
        </p>
      </article>

      <div class="card mt-4">
        <DataTable :value="collaborators" responsiveLayout="scroll" :paginator="true" :rows="5" class="p-datatable-sm shadow-2 border-round">
          <Column field="name" :header="t('corporate.collaborators.colCollaborator')" :sortable="true"></Column>
          <Column field="email" :header="t('corporate.collaborators.colEmail')"></Column>
          <Column field="status" :header="t('corporate.collaborators.colStatus')">
            <template #body="slotProps">
              <Tag :value="getStatusLabel(slotProps.data.status)" :severity="getSeverity(slotProps.data.status)" />
            </template>
          </Column>
          <Column field="sentAt" :header="t('corporate.collaborators.colSent')">
            <template #body="slotProps">
              {{ slotProps.data.sentAt ? t('corporate.collaborators.sentToday', { time: formatTime(slotProps.data.sentAt) }) : '—' }}
            </template>
          </Column>
        </DataTable>
      </div>

    </template>
  </section>
</template>

<style scoped>
.bt-upload-actions {
  display: flex;
  align-items: stretch;
  gap: 12px;
  flex-wrap: wrap;
}

.bt-file-input {
  display: none;
}

.bt-file-picker {
  flex: 1 1 280px;
  min-width: 220px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid var(--surface-border, #d7dde7);
  border-radius: 8px;
  background: #fff;
  color: var(--bt-navy, #0b2147);
  cursor: pointer;
  text-align: left;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.bt-file-picker:hover:not(:disabled),
.bt-file-picker:focus-visible {
  border-color: var(--primary-color, #155a92);
  box-shadow: 0 0 0 3px rgba(21, 90, 146, 0.12);
  outline: none;
}

.bt-file-picker:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.bt-file-picker__icon {
  width: 42px;
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  border-radius: 8px;
  background: rgba(21, 90, 146, 0.1);
  color: var(--primary-color, #155a92);
}

.bt-file-picker__icon svg {
  width: 22px;
  height: 22px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.bt-file-picker__text {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.bt-file-picker__text strong,
.bt-file-picker__text small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bt-file-picker__text strong {
  font-size: 0.95rem;
  font-weight: 700;
}

.bt-file-picker__text small {
  color: var(--text-color-secondary, #64748b);
  font-size: 0.8rem;
}

.bt-upload-icon-button {
  width: 48px;
  min-width: 48px;
}
</style>
