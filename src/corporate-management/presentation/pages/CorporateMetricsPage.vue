<script setup>
import { ref, computed, onMounted } from 'vue'
import Button from 'primevue/button'
import { useCorporateManagementStore } from '../../application/corporate-management.store'

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
        <p class="microcopy">US17 · ESCENARIO 1</p>
        <h1>Consolidación de métricas</h1>
        <p class="text-muted">Anonimización completada · Abril 2026</p>
      </div>
      <div
          class="bt-kpi-card"
          style="min-height: auto; padding: 12px 20px; border-radius: 999px; text-align: center; width: max-content;"
          :style="published ? 'background: var(--bt-success); border-color: var(--bt-success);' : 'background: var(--bt-success-soft); border-color: var(--bt-success);'"
      >
        <span :style="published ? 'color: white;' : 'color: var(--bt-success-dark);'">
          {{ published ? 'Publicado ✓' : 'Pendiente' }}
        </span>
      </div>
    </header>

    <p v-if="loading" class="text-muted">Cargando métricas...</p>

    <template v-else>

      <div
          v-if="published"
          class="bt-panel-note"
          style="border-radius: 8px; padding: 12px 16px; background: var(--bt-success-soft); border-color: var(--bt-success);"
      >
        ✓ <strong>Métricas consolidadas y publicadas</strong> — Datos grupales anonimizados. Ningún dato individual es identificable.
      </div>

      <section class="bt-kpi-grid" v-if="metric">
        <article class="bt-kpi-card bt-kpi-card--primary">
          <span>Colaboradores incluidos</span>
          <strong>{{ metric.sampleSize }}</strong>
        </article>
        <article class="bt-kpi-card">
          <span>Adherencia promedio</span>
          <strong>{{ metric.averages?.adherence }}%</strong>
          <div class="bt-mini-track"><span /></div>
        </article>
        <article class="bt-kpi-card">
          <span>IMC promedio grupal</span>
          <strong>{{ metric.averages?.bmi }}</strong>
          <small>Rango normal (18.5–24.9)</small>
        </article>
        <article class="bt-kpi-card" :class="published ? 'bt-kpi-card--success' : ''">
          <span>Estado</span>
          <strong>{{ published ? 'Publicado' : 'Sin publicar' }}</strong>
        </article>
      </section>

      <div v-if="!published">
        <Button
            :label="publishing ? 'Publicando...' : 'Publicar métricas'"
            :disabled="publishing || !canPublish"
            class="bt-dashboard-export"
            @click="handlePublish"
        />
      </div>

      <article class="bt-dashboard-panel" v-if="metric">
        <div class="bt-panel-header">
          <h3>Detalle de anonimización</h3>
        </div>
        <div class="bt-goal-list">
          <div class="bt-goal-row">
            <span>Datos procesados</span>
            <strong>{{ metric.sampleSize }} perfiles</strong>
          </div>
          <div class="bt-goal-row">
            <span>Umbral mínimo de anonimato</span>
            <strong>10 perfiles</strong>
          </div>
          <div class="bt-goal-row">
            <span>Datos individuales expuestos</span>
            <strong style="color: var(--bt-danger)">0 — NINGUNO</strong>
          </div>
          <div class="bt-goal-row">
            <span>Período</span>
            <strong>01/04/2026 – 30/04/2026</strong>
          </div>
        </div>
      </article>

    </template>
  </section>
</template>