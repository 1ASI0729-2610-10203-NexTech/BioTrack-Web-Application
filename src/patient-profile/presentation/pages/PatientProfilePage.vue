<script setup>
import ContextPanel from '../../../shared/presentation/components/context-panel.vue'
import ProfileHealthSummary from '../components/profile-health-summary.vue'
</script>

<template>
  <ContextPanel
    eyebrow="BC02 patient-profile"
    title="Perfil del paciente"
    description="Dominio preparado para validar peso, talla, edad, presion y glucosa sin trasladar reglas a Vue."
  >
    <ProfileHealthSummary />
    <ul class="rule-list">
      <li>Restricciones dietarias y metas nutricionales viven en el modelo.</li>
      <li>El IMC se calcula con `calculateBMI`.</li>
      <li>El evento de perfil completo se emite desde la entidad.</li>
    </ul>
  </ContextPanel>
</template>
