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
      <svg class="pt-topbar__leaf" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
          fill="currentColor"
          d="M12.5 2C8 2.5 4.5 6 4 11c-.2 2.5.8 4.8 2.6 6.4L12 22l5.4-4.6c1.8-1.6 2.8-3.9 2.6-6.4C19.5 6 16 2.5 11.5 2c.3 0 .7-.01 1 0z"
        />
      </svg>
      <div class="pt-topbar__logo">BioTrack</div>
    </div>
    <div class="pt-topbar__actions">
      <button type="button" class="pt-icon-button" aria-label="Notificaciones">
        <i class="pi pi-bell" aria-hidden="true" />
      </button>
      <span class="pt-avatar" :aria-label="`Usuario ${sessionUser.initials}`">{{ sessionUser.initials }}</span>
    </div>
  </header>
</template>
