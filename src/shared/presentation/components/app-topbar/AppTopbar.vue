<script setup>
import Avatar from 'primevue/avatar'
import Button from 'primevue/button'

defineEmits(['toggle-navigation'])
</script>

<template>
  <header class="bt-enterprise-topbar">
    <div class="bt-topbar-leading">
      <Button
        icon="pi pi-bars"
        text
        rounded
        class="bt-topbar-menu-button"
        aria-label="Abrir navegacion"
        @click="$emit('toggle-navigation')"
      />
    </div>

    <div class="bt-topbar-actions">
      <Button
        icon="pi pi-bell"
        text
        rounded
        class="bt-topbar-icon-button"
        aria-label="Notificaciones"
      />
      <Avatar label="CR" shape="circle" class="bt-topbar-avatar" />
    </div>
  </header>
</template>
