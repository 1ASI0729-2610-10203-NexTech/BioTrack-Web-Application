<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useIdentityAccessStore } from '../../../identity-access/application/identity-access.store'
import { progressTrackingRepository } from '../../infrastructure/progress-tracking.repository.js'

const route = useRoute()
const identityAccessStore = useIdentityAccessStore()

const sessionUser = ref({ fullName: '', role: '', initials: 'JP' })

onMounted(() => {
  sessionUser.value = progressTrackingRepository.getSessionUser()
})

const navItems = [
  { label: 'Dashboard', icon: 'pi pi-home', to: '/dashboard' },
  { label: 'Mi Perfil', icon: 'pi pi-user', to: '/patient-profile' },
  { label: 'Mis Pacientes', icon: 'pi pi-users', to: '/patients', roles: ['NUTRICIONISTA'] },
  { label: 'Plan Nutricional', icon: 'pi pi-check-square', to: '/nutritional-plan' },
  { label: 'Mi Progreso', icon: 'pi pi-chart-line', to: '/progress-tracking/consumption-record' },
  { label: 'Consultas', icon: 'pi pi-calendar', to: '/consultations', roles: ['PACIENTE', 'NUTRICIONISTA'] },
  { label: 'Facturación', icon: 'pi pi-credit-card', to: '/subscriptions-billing' },
]

function isVisible(item) {
  if (!item.roles?.length) return true
  return item.roles.includes(identityAccessStore.role)
}

function isProgressSectionActive() {
  return route.path.startsWith('/progress-tracking')
}

const progressModuleLinks = [
  { label: 'Registro de consumo', to: '/progress-tracking/consumption-record' },
  { label: 'Gráfico de progreso', to: '/progress-tracking/progress-chart' },
  { label: 'Adherencia al plan', to: '/progress-tracking/adherence-plan' },
  { label: 'Peso semanal', to: '/progress-tracking/update-weekly-weight' },
  { label: 'Actividad física', to: '/progress-tracking/activity-record' },
]
</script>

<template>
  <aside class="pt-sidebar" aria-label="Navegación principal del módulo">
    <img src="../../../assets/logo.png" alt="BioTrack" class="pt-sidebar__brand-logo" />
    <p class="pt-sidebar__menu-label">Menú</p>
    <nav class="pt-sidebar__nav" aria-label="Menú principal">
      <RouterLink
        v-for="item in navItems"
        v-show="isVisible(item)"
        :key="item.to"
        :to="item.to"
        class="pt-sidebar__link"
        :class="{ 'pt-sidebar__link--active': item.to.includes('/progress-tracking') && isProgressSectionActive() }"
      >
        <i :class="item.icon" aria-hidden="true" />
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>

    <section
      v-if="isProgressSectionActive()"
      class="pt-sidebar__section"
      aria-label="Secciones de mi progreso"
    >
      <p class="pt-sidebar__section-title">Mi progreso</p>
      <RouterLink
        v-for="item in progressModuleLinks"
        :key="item.to"
        :to="item.to"
        class="pt-sidebar__sublink"
        :class="{ 'pt-sidebar__sublink--active': route.path === item.to }"
      >
        {{ item.label }}
      </RouterLink>
    </section>

    <div class="pt-sidebar__footer">
      <div class="pt-sidebar__user">
        <span class="pt-sidebar__avatar" aria-hidden="true">{{ sessionUser.initials }}</span>
        <div class="pt-sidebar__user-text">
          <strong>{{ sessionUser.fullName }}</strong>
          <span>{{ sessionUser.role }}</span>
        </div>
      </div>
    </div>
  </aside>
</template>
