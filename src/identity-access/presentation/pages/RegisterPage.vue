<script setup>
import { reactive } from 'vue'
import ContextPanel from '../../../shared/presentation/components/context-panel.vue'
import AuthRuleList from '../components/auth-rule-list.vue'

const form = reactive({
  email: '',
  accountType: 'patient',
})
</script>

<template>
  <ContextPanel
    eyebrow="BC01 identity-access"
    title="Registro"
    description="Registro inicial con seleccion explicita del tipo de cuenta."
  >
    <form class="form-grid">
      <label>
        Correo
        <input v-model="form.email" type="email" placeholder="nuevo@biotrack.com" />
      </label>
      <label>
        Tipo de cuenta
        <select v-model="form.accountType">
          <option value="patient">Paciente</option>
          <option value="nutritionist">Nutricionista</option>
          <option value="corporate-admin">Admin corporativo</option>
        </select>
      </label>
      <button type="button">Crear cuenta</button>
    </form>
    <AuthRuleList />
  </ContextPanel>
</template>
