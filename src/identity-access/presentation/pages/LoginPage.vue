<script setup>
import { reactive } from 'vue'
import ContextPanel from '../../../shared/presentation/components/context-panel.vue'
import AuthRuleList from '../components/auth-rule-list.vue'

const form = reactive({ email: '', password: '' })
</script>

<template>
  <ContextPanel
    eyebrow="BC01 identity-access"
    title="Login"
    description="Pantalla base para autenticacion. El flujo HTTP queda encapsulado en infraestructura y Pinia."
  >
    <form class="form-grid">
      <label>
        Correo
        <input v-model="form.email" type="email" placeholder="paciente@biotrack.com" />
      </label>
      <label>
        Contrasena
        <input v-model="form.password" type="password" placeholder="••••••••" />
      </label>
      <button type="button">Ingresar</button>
    </form>
    <AuthRuleList />
  </ContextPanel>
</template>
