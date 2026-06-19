<script setup>
import ContextPanel from '../../../shared/presentation/components/context-panel.vue'
import PlanRulesSummary from '../components/plan-rules-summary.vue'
</script>

<template>
  <ContextPanel
    eyebrow="BC04 nutritional-planning"
    title="Planificacion nutricional"
    description="Planes, dias, comidas, controles y estados de aprobacion encapsulados en el dominio."
  >
    <PlanRulesSummary />
    <ul class="rule-list">
      <li>No hay plan si la evaluacion inicial no esta completada.</li>
      <li>Los planes rechazados requieren observacion.</li>
      <li>Estados soportados: propuesto, activo, rechazado, finalizado y suspendido.</li>
    </ul>
  </ContextPanel>
</template>
