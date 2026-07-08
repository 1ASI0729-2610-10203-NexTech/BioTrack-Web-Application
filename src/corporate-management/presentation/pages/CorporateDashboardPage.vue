<script setup>
import { onMounted, computed } from "vue";
import { useI18n } from "vue-i18n";
import {useCorporateManagementStore} from "../../application/corporate-management.store.js";
import Button from "primevue/button";
import Tag from "primevue/tag";
import ProgressBar from "primevue/progressbar";
import Message from "primevue/message";
import { useIdentityAccessStore } from "../../../identity-access/application/identity-access.store";
import {corporateManagementApiService} from "../../infrastructure/corporate-management-api.service.js";

const { t } = useI18n();
const corporateStore = useCorporateManagementStore();


onMounted(async () => {
  await corporateStore.loadMetrics();
});

const identityAccessStore = useIdentityAccessStore();

const currentMetrics = computed(() => corporateStore.publishableMetrics[0] || null);

const hasData = computed(() => currentMetrics.value && currentMetrics.value.averages);
</script>

<template>
  <div class="bt-corporate-layout">
    <!-- Main header -->
    <header class="bt-dashboard-header">
      <div class="header-info">
        <p class="microcopy">{{ t('corporate.dashboard.eyebrow') }}</p>
        <h1>{{ t('corporate.dashboard.title') }}</h1>
        <p class="text-muted">
          {{ t('corporate.dashboard.subtitle', { date: new Date().toLocaleDateString() }) }}
        </p>
      </div>
      <Button :label="t('corporate.dashboard.exportReport')" icon="pi pi-download" class="p-button-rounded p-button-sm" />
    </header>
    <!-- Main metrics grid -->
    <section class="bt-metrics-grid">
      <article class="bt-metric-card bt-card-blue">
        <span class="card-label">{{ t('corporate.dashboard.activeCollaborators') }}</span>
        <strong class="card-value">{{ currentMetrics?.sampleSize ?? 0 }}</strong>
        <small class="card-footer"><i class="pi pi-arrow-up"></i> {{ t('corporate.dashboard.vsLastMonth', { percent: 12 }) }}</small>
      </article>

      <article class="bt-metric-card">
        <span class="card-label">{{ t('corporate.dashboard.averageAdherence') }}</span>
        <strong class="card-value">{{ currentMetrics?.averages?.adherence ?? 0 }}%</strong>
        <ProgressBar :value="currentMetrics?.averages?.adherence ?? 0" :showValue="false" class="bt-progress-sm" />
      </article>

      <article class="bt-metric-card">
        <span class="card-label">{{ t('corporate.dashboard.averageGroupBMI') }}</span>
        <strong class="card-value">{{ currentMetrics?.averages?.bmi ?? '--' }}</strong>
        <small class="card-footer">{{ t('corporate.dashboard.normalRange') }}</small>
      </article>

      <article class="bt-metric-card bt-card-green">
        <span class="card-label">{{ t('corporate.dashboard.usedLicenses') }}</span>
        <strong class="card-value">247/300</strong>
        <small class="card-footer">{{ t('corporate.dashboard.capacity', { percent: 82 }) }}</small>
      </article>
    </section>

    <!-- Lower section: Chart and Goals -->
    <div class="bt-content-split">
      <section class="bt-panel bt-evolution-chart">
        <div class="panel-header">
          <h3>{{ t('corporate.dashboard.monthlyAdherenceEvolution') }}</h3>
        </div>
        <div class="chart-mock">
          <div class="mock-bars"></div>
          <div class="mock-labels">
             <span>En</span><span>Feb</span><span>Mar</span><span>Abr</span>
          </div>
        </div>
      </section>

      <section class="bt-panel bt-goals-distribution">
        <h3>{{ t('corporate.dashboard.goalsDistribution') }}</h3>

        <div class="goal-item">
          <div class="goal-info"><span>{{ t('corporate.dashboard.loseWeight') }}</span> <b>42%</b></div>
          <ProgressBar :value="42" :showValue="false" class="goal-bar goal-blue" />
        </div>

        <div class="goal-item">
          <div class="goal-info"><span>{{ t('corporate.dashboard.maintainWeight') }}</span> <b>35%</b></div>
          <ProgressBar :value="35" :showValue="false" class="goal-bar goal-green" />
        </div>

        <div class="goal-item">
          <div class="goal-info"><span>{{ t('corporate.dashboard.gainMass') }}</span> <b>23%</b></div>
          <ProgressBar :value="23" :showValue="false" class="goal-bar goal-orange" />
        </div>

        <p class="disclaimer">
          <i class="pi pi-exclamation-triangle"></i> {{ t('corporate.dashboard.anonymousDisclaimer') }}
        </p>
      </section>
    </div>
  </div>
</template>

<style scoped>
/* Contenedor Principal */
.bt-corporate-layout {
  background-color: #f8fafc;
  padding: 1rem; /* Reducido para móviles */
  font-size: 1rem;
  font-family: 'Poppins', 'Segoe UI', sans-serif;
  color: #334155;
  min-height: 100vh;
}

/* Header Responsivo */
.bt-dashboard-header {
  display: flex;
  flex-direction: column; /* Apilado por defecto en móvil */
  gap: 1.5rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 1.5rem;
}

.bt-dashboard-header h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0.25rem 0;
}

/* Grid de Tarjetas - Adaptable */
.bt-metrics-grid {
  display: grid;
  grid-template-columns: 1fr; /* 1 columna en móvil */
  gap: 1rem;
  margin-bottom: 2rem;
}

.bt-metric-card {
  background: white;
  padding: 1.25rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 110px;
}

/* Variantes de Color */
.bt-card-blue { background-color: #0f4c81; color: white; border: none; }
.bt-card-green { background-color: #10b981; color: white; border: none; }

.card-label { font-size: 0.8rem; font-weight: 500; opacity: 0.9; }
.card-value { font-size: 1.8rem; font-weight: 600; margin: 0.4rem 0; }
.card-footer { font-size: 0.75rem; opacity: 0.8; }

/* Contenido inferior (Gráfico y Objetivos) */
.bt-content-split {
  display: grid;
  grid-template-columns: 1.8fr 1.2fr;
  gap: 1.5rem;
}

.bt-panel {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.bt-panel h3 {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #1e293b;
}

/* Gráfico Mock */
.chart-mock {
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.mock-labels {
  display: flex;
  justify-content: space-between;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
  font-size: 0.75rem;
  color: #94a3b8;
}

/* --- MEDIA QUERIES PARA PANTALLAS GRANDES --- */

@media (min-width: 768px) {
  .bt-corporate-layout {
    padding: 2rem;
  }

  .bt-dashboard-header {
    flex-direction: row; /* Horizontal en desktop */
    justify-content: space-between;
    align-items: center;
  }

  .bt-dashboard-header h1 {
    font-size: 1.75rem;
  }

  .bt-metrics-grid {
    grid-template-columns: repeat(2, 1fr); /* 2 columnas en tablets */
  }
}

@media (min-width: 1100px) {
  .bt-metrics-grid {
    grid-template-columns: repeat(4, 1fr); /* 4 columnas en desktop */
  }

  .bt-content-split {
    grid-template-columns: 1.8fr 1.2fr; /* Layout dividido original */
  }
}

/* Ajustes de PrimeVue */
:deep(.p-button.p-button-sm) {
  background-color: #0f4c81;
  border: none;
  width: fit-content;
}

.bt-progress-sm {
  height: 8px;
  background: #e2e8f0;
  border-radius: 10px;
  margin-top: 0.5rem;
}

:deep(.bt-card-blue .p-progressbar-value) { background: #38bdf8; }

.goal-item { margin-bottom: 1.5rem; }
.goal-info { display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.85rem; font-weight: 500; }
.goal-blue :deep(.p-progressbar-value) { background: #0f4c81; }
.goal-green :deep(.p-progressbar-value) { background: #10b981; }
.goal-orange :deep(.p-progressbar-value) { background: #f59e0b; }

.disclaimer {
  margin-top: 1.5rem;
  font-size: 0.7rem;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-top: 1px solid #f1f5f9;
  padding-top: 1rem;
}
</style>
