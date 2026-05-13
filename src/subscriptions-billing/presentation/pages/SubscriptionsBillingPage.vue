<script setup>
import ContextPanel from '../../../shared/presentation/components/context-panel.vue'
import BillingSummary from '../components/billing-summary.vue'
</script>

<template>
  <ContextPanel
    eyebrow="BC06 subscriptions-billing"
    title="Suscripciones y facturacion"
    description="B2C, B2B, pagos, comprobantes y reglas de licenciamiento centralizadas."
  >
    <BillingSummary />
    <ul class="rule-list">
      <li>`licensesUsed` nunca puede superar `licensesTotal`.</li>
      <li>Las suscripciones corporativas e individuales comparten contratos, no implementacion accidental.</li>
      <li>Los estados se expresan con value objects.</li>
    </ul>
  </ContextPanel>
</template>
