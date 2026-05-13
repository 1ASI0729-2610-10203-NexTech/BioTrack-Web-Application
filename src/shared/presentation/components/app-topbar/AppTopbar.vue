<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Avatar from 'primevue/avatar'
import Button from 'primevue/button'
import Menu from 'primevue/menu'
import { useIdentityAccessStore } from '../../../../identity-access/application/identity-access.store'
import { usePatientProfileStore } from '../../../../patient-profile/application/patient-profile.store'
import { usePatientPlanStore } from '../../../../nutritional-planning/application/patient-plan.store'
import { usePatientProgressStore } from '../../../../progress-tracking/application/patient-progress.store'
import { useSubscriptionsBillingStore } from '../../../../subscriptions-billing/application/subscriptions-billing.store'

defineEmits(['toggle-navigation'])

const router = useRouter()
const toast = useToast()
const userMenu = ref(null)
const identityAccessStore = useIdentityAccessStore()
const patientProfileStore = usePatientProfileStore()
const patientPlanStore = usePatientPlanStore()
const patientProgressStore = usePatientProgressStore()
const subscriptionsBillingStore = useSubscriptionsBillingStore()

const currentUser = computed(() => identityAccessStore.currentUser)
const userName = computed(() => {
  if (currentUser.value?.name) return currentUser.value.name
  return [currentUser.value?.firstName, currentUser.value?.lastName].filter(Boolean).join(' ')
})
const userInitials = computed(() => {
  const nameParts = userName.value.trim().split(/\s+/).filter(Boolean)
  if (!nameParts.length) return 'BT'
  return nameParts
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
})
const roleLabel = computed(() =>
  (currentUser.value?.role ?? 'USUARIO').replaceAll('_', ' '),
)
const profileRoute = computed(() => {
  const routeByRole = {
    PACIENTE: '/patient-profile',
    NUTRICIONISTA: '/nutritionist-dashboard',
    ADMIN_CORPORATIVO: '/corporate-dashboard',
  }
  return routeByRole[currentUser.value?.role] ?? '/login'
})
const menuItems = computed(() => [
  {
    label: 'Mi perfil',
    icon: 'pi pi-user',
    command: () => router.push(profileRoute.value),
  },
  {
    label: 'Configuracion',
    icon: 'pi pi-cog',
    command: () =>
      toast.add({
        severity: 'info',
        summary: 'Configuracion',
        detail: 'Configuracion de usuario proximamente.',
        life: 2500,
      }),
  },
  { separator: true },
  {
    label: 'Cerrar sesion',
    icon: 'pi pi-sign-out',
    class: 'bt-user-menu-danger',
    styleClass: 'bt-user-menu-danger',
    command: handleLogout,
  },
])

function toggleUserMenu(event) {
  userMenu.value?.toggle(event)
}

function resetUiStores() {
  patientProfileStore.$reset()
  patientPlanStore.$reset()
  patientProgressStore.$reset()
  subscriptionsBillingStore.$reset()
}

async function handleLogout() {
  userMenu.value?.hide()
  identityAccessStore.logout()
  resetUiStores()
  toast.add({
    severity: 'success',
    summary: 'Sesion cerrada',
    detail: 'Sesion cerrada correctamente',
    life: 3000,
  })
  await router.push('/login')
}
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
      <button
        type="button"
        class="bt-topbar-user-button"
        :aria-label="`Abrir menu de usuario de ${userName || 'BioTrack'}`"
        aria-haspopup="menu"
        @click="toggleUserMenu"
      >
        <Avatar :label="userInitials" shape="circle" class="bt-topbar-avatar" />
      </button>
      <Menu ref="userMenu" :model="menuItems" popup class="bt-user-menu">
        <template #start>
          <div class="bt-user-menu-header">
            <Avatar :label="userInitials" shape="circle" class="bt-user-menu-avatar" />
            <div>
              <strong>{{ userName || 'BioTrack' }}</strong>
              <span>{{ roleLabel }}</span>
            </div>
          </div>
        </template>
      </Menu>
    </div>
  </header>
</template>
