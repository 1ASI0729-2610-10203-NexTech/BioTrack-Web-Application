<script setup>
import ContextPanel from '../../../shared/presentation/components/context-panel.vue'
import ProgressAlertSummary from '../components/progress-alert-summary.vue'
</script>

<template>
  <ContextPanel
    eyebrow="BC05 progress-tracking"
    title="Seguimiento de progreso"
    description="Registros, adherencia, alertas y reportes evolucionan desde reglas del dominio."
  >
    <ProgressAlertSummary />
    <ul class="rule-list">
      <li>Un unico registro por paciente, fecha y tipo de comida.</li>
      <li>No se repite la alerta de baja adherencia en el mismo periodo.</li>
      <li>El PDF exige datos suficientes antes de generarse.</li>
    </ul>
  </ContextPanel>
</template>
