<script setup>
import ContextPanel from '../../../shared/presentation/components/context-panel.vue'
import CorporatePrivacySummary from '../components/corporate-privacy-summary.vue'
</script>

<template>
  <ContextPanel
    eyebrow="BC03 corporate-management"
    title="Dashboard corporativo"
    description="Vista agregada para empresas, colaboradores y metricas anonimizadas."
  >
    <CorporatePrivacySummary />
    <ul class="rule-list">
      <li>RUC validado mediante value object.</li>
      <li>`CorporateMetric` decide si puede publicarse.</li>
      <li>La presentacion nunca expone datos clinicos individuales.</li>
    </ul>
  </ContextPanel>
</template>
