<script setup>
defineProps({
  mode: {
    type: String,
    default: 'login',
    validator: (value) => ['login', 'register'].includes(value),
  },
})
</script>

<template>
  <header class="bt-auth-header">
    <RouterLink class="bt-auth-brand" to="/login" aria-label="BioTrack">
      <span>Bio</span>
    </RouterLink>

    <p class="bt-auth-switch">
      <template v-if="mode === 'register'">
        ¿Ya tienes cuenta?
        <RouterLink to="/login">Iniciar sesion</RouterLink>
      </template>
      <template v-else>
        ¿No tienes cuenta?
        <RouterLink to="/register">Crear cuenta</RouterLink>
      </template>
    </p>
  </header>
</template>
