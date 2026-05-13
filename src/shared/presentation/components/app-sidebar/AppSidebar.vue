<script setup>
import Avatar from 'primevue/avatar'
import ScrollPanel from 'primevue/scrollpanel'

defineProps({
  drawer: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['navigate'])

const navigationItems = [
  { label: 'Dashboard', icon: 'pi pi-home', to: '/corporate-dashboard' },
  { label: 'Mi Perfil', icon: 'pi pi-user', to: '/patient-profile' },
  { label: 'Mis Pacientes', icon: 'pi pi-users', to: '/corporate-dashboard' },
  { label: 'Plan Nutricional', icon: 'pi pi-check-square', to: '/nutritional-planning' },
  { label: 'Mi Progreso', icon: 'pi pi-chart-bar', to: '/progress-tracking' },
  { label: 'Facturacion', icon: 'pi pi-credit-card', to: '/subscriptions-billing' },
]
</script>

<template>
  <aside class="bt-enterprise-sidebar" :class="{ 'bt-enterprise-sidebar--drawer': drawer }">
    <div class="bt-sidebar-top">
      <RouterLink class="bt-brand-mark" to="/corporate-dashboard" @click="$emit('navigate')">
        <span class="bt-brand-symbol" aria-hidden="true">Bio</span>
      </RouterLink>

      <section class="bt-sidebar-menu">
        <p class="microcopy bt-sidebar-caption">Menu</p>

        <ScrollPanel class="bt-sidebar-scroll">
          <nav class="bt-sidebar-nav" aria-label="Navegacion principal">
            <RouterLink
              v-for="item in navigationItems"
              :key="item.label"
              v-ripple
              class="bt-sidebar-link"
              :to="item.to"
              @click="$emit('navigate')"
            >
              <i :class="item.icon" aria-hidden="true" />
              <span>{{ item.label }}</span>
            </RouterLink>
          </nav>
        </ScrollPanel>
      </section>
    </div>

    <footer class="bt-sidebar-profile">
      <Avatar label="JP" shape="circle" class="bt-sidebar-avatar" />
      <div class="bt-sidebar-profile-copy">
        <strong>Juan Perez</strong>
        <span>Paciente</span>
      </div>
    </footer>
  </aside>
</template>
