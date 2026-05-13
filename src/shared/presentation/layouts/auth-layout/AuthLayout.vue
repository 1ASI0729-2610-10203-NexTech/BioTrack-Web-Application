<script setup>
import AuthHeader from '../../components/auth-header/AuthHeader.vue'

defineProps({
  mode: {
    type: String,
    default: 'login',
    validator: (value) => ['login', 'register'].includes(value),
  },
})
</script>

<template>
  <div class="bt-auth-shell">
    <AuthHeader :mode="mode" />
    <main class="bt-auth-main">
      <slot />
    </main>
  </div>
</template>
