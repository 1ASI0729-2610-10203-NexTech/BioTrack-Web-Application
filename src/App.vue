<script setup>
import AppContent from './shared/presentation/components/AppContent.vue'
import AppLayout from './shared/presentation/components/AppLayout.vue'
import AppTopbar from './shared/presentation/components/AppTopbar.vue'
</script>

<template>
  <AppLayout>
    <AppTopbar class="topbar">
      <RouterLink class="brand" to="/patient-profile">BioTrack</RouterLink>
      <nav class="nav">
        <RouterLink to="/login">Login</RouterLink>
        <RouterLink to="/register">Registro</RouterLink>
        <RouterLink to="/patient-profile">Perfil</RouterLink>
        <RouterLink to="/corporate-dashboard">Corporativo</RouterLink>
        <RouterLink to="/nutritional-planning">Planes</RouterLink>
        <RouterLink to="/progress-tracking">Progreso</RouterLink>
        <RouterLink to="/subscriptions-billing">Billing</RouterLink>
      </nav>
    </AppTopbar>

    <AppContent>
      <RouterView />
    </AppContent>
  </AppLayout>
</template>
