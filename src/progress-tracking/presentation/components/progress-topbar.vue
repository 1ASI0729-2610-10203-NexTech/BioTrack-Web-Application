<script setup>
import { onMounted, ref } from 'vue'
import { progressTrackingRepository } from '../../infrastructure/progress-tracking.repository.js'

const sessionUser = ref({ initials: 'JP' })

onMounted(() => {
  sessionUser.value = progressTrackingRepository.getSessionUser()
})
</script>

<template>
  <header class="pt-topbar">
    <div class="pt-topbar__brand">
      <img src="../../../assets/logo.png" alt="BioTrack" class="pt-topbar__logo-img" />
    </div>
    <div class="pt-topbar__actions">
      <button type="button" class="pt-icon-button" aria-label="Notificaciones">
        <i class="pi pi-bell" aria-hidden="true" />
      </button>
      <span class="pt-avatar" :aria-label="`Usuario ${sessionUser.initials}`">{{ sessionUser.initials }}</span>
    </div>
  </header>
</template>
