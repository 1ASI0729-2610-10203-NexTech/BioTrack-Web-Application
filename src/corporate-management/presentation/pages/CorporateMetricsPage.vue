<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import { useCorporateManagementStore } from '../../application/corporate-management.store'

const { t } = useI18n()
const store = useCorporateManagementStore()
const loading = ref(true)
const publishing = ref(false)
const published = ref(false)

const metric = computed(() => store.metrics[0] ?? null)
const canPublish = computed(() => store.publishableMetrics.length > 0)

async function loadMetrics() {
  loading.value = true
  try {
    await store.loadMetrics()
  } finally {
    loading.value = false
  }
}

async function handlePublish() {
  publishing.value = true
  try {
    await new Promise((r) => setTimeout(r, 800))
    published.value = true
  } finally {
    publishing.value = false
  }
}

onMounted(loadMetrics)
</script>

<template>
  <section class="bt-corporate-dashboard">

    <header class="bt-dashboard-heading">
      <div>
        <p class="microcopy">{{ t('corporate.metrics.eyebrow') }}</p>
        <h1>{{ t('corporate.metrics.title') }}</h1>
        <p class="text-muted">{{ t('corporate.metrics.subtitle') }}</p>
      </div>
      <div
          class="bt-kpi-card"
          style="min-height: auto; padding: 12px 20px; border-radius: 999px; text-align: center; width: max-content;"
          :style="published ? 'background: var(--bt-success); border-color: var(--bt-success);' : 'background: var(--bt-success-soft); border-color: var(--bt-success);'"
      >
        <span :style="published ? 'color: white;' : 'color: var(--bt-success-dark);'">
          {{ published ? t('corporate.metrics.published') : t('corporate.metrics.pendingPublish') }}
        </span>
      </div>
    </header>

    <p v-if="loading" class="text-muted">{{ t('corporate.metrics.loading') }}</p>

    <template v-else>

      <div
          v-if="published"
          class="bt-panel-note"
          style="border-radius: 8px; padding: 12px 16px; background: var(--bt-success-soft); border-color: var(--bt-success);"
      >
        ✓ <strong>{{ t('corporate.metrics.publishedSuccess') }}</strong>
      </div>

      <section class="bt-kpi-grid" v-if="metric">
        <article class="bt-kpi-card bt-kpi-card--primary">
          <span>{{ t('corporate.metrics.includedCollaborators') }}</span>
          <strong>{{ metric.sampleSize }}</strong>
        </article>
        <article class="bt-kpi-card">
          <span>{{ t('corporate.metrics.averageAdherence') }}</span>
          <strong>{{ metric.averages?.adherence }}%</strong>
          <div class="bt-mini-track"><span /></div>
        </article>
        <article class="bt-kpi-card">
          <span>{{ t('corporate.metrics.averageGroupBMI') }}</span>
          <strong>{{ metric.averages?.bmi }}</strong>
          <small>{{ t('corporate.metrics.normalRange') }}</small>
        </article>
        <article class="bt-kpi-card" :class="published ? 'bt-kpi-card--success' : ''">
          <span>{{ t('corporate.metrics.status') }}</span>
          <strong>{{ published ? t('corporate.metrics.statusPublished') : t('corporate.metrics.statusUnpublished') }}</strong>
        </article>
      </section>

      <div v-if="!published">
        <Button
            :label="publishing ? t('corporate.metrics.publishing') : t('corporate.metrics.publishMetrics')"
            :disabled="publishing || !canPublish"
            class="bt-dashboard-export"
            @click="handlePublish"
        />
      </div>

      <article class="bt-dashboard-panel" v-if="metric">
        <div class="bt-panel-header">
          <h3>{{ t('corporate.metrics.anonymizationDetail') }}</h3>
        </div>
        <div class="bt-goal-list">
          <div class="bt-goal-row">
            <span>{{ t('corporate.metrics.processedData') }}</span>
            <strong>{{ t('corporate.metrics.processedProfiles', { count: metric.sampleSize }) }}</strong>
          </div>
          <div class="bt-goal-row">
            <span>{{ t('corporate.metrics.minAnonymityThreshold') }}</span>
            <strong>{{ t('corporate.metrics.minAnonymityValue') }}</strong>
          </div>
          <div class="bt-goal-row">
            <span>{{ t('corporate.metrics.exposedIndividualData') }}</span>
            <strong style="color: var(--bt-danger)">{{ t('corporate.metrics.exposedIndividualValue') }}</strong>
          </div>
          <div class="bt-goal-row">
            <span>{{ t('corporate.metrics.period') }}</span>
            <strong>01/04/2026 – 30/04/2026</strong>
          </div>
        </div>
      </article>

    </template>
  </section>
</template>
