<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import Avatar from 'primevue/avatar'
import Button from 'primevue/button'
import Menu from 'primevue/menu'
import { useIdentityAccessStore } from '../../../../identity-access/application/identity-access.store'
import { usePatientProfileStore } from '../../../../patient-profile/application/patient-profile.store'
import { usePatientPlanStore } from '../../../../nutritional-planning/application/patient-plan.store'
import { useNutritionistStore } from '../../../../nutritional-planning/application/nutritionist.store'
import { usePatientProgressStore } from '../../../../progress-tracking/application/patient-progress.store'
import { useSubscriptionsBillingStore } from '../../../../subscriptions-billing/application/subscriptions-billing.store'
import LanguageSwitcher from '../language-switcher/LanguageSwitcher.vue'

defineEmits(['toggle-navigation'])

const router = useRouter()
const toast = useToast()
const { t } = useI18n()
const userMenu = ref(null)
const identityAccessStore = useIdentityAccessStore()
const patientProfileStore = usePatientProfileStore()
const patientPlanStore = usePatientPlanStore()
const nutritionistStore = useNutritionistStore()
const patientProgressStore = usePatientProgressStore()
const subscriptionsBillingStore = useSubscriptionsBillingStore()
const DEFAULT_AVATAR_URL = 'https://i.pravatar.cc/150?img=33'

const currentUser = computed(() => identityAccessStore.currentUser)
const userName = computed(() => {
  if (currentUser.value?.name) return currentUser.value.name
  return [currentUser.value?.firstName, currentUser.value?.lastName].filter(Boolean).join(' ')
})
const userAvatarUrl = computed(() =>
  currentUser.value ? currentUser.value.avatarUrl || DEFAULT_AVATAR_URL : '',
)
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
  t(`roles.${currentUser.value?.role ?? 'USUARIO'}`),
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
    label: t('auth.profile'),
    icon: 'pi pi-user',
    command: () => router.push(profileRoute.value),
  },
  {
    label: t('auth.settings'),
    icon: 'pi pi-cog',
    command: () =>
      toast.add({
        severity: 'info',
        summary: t('auth.settings'),
        detail: t('auth.settingsSoon'),
        life: 2500,
      }),
  },
  { separator: true },
  {
    label: t('auth.logout'),
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
  nutritionistStore.$reset()
  patientProgressStore.$reset()
  subscriptionsBillingStore.$reset()
}

async function handleLogout() {
  userMenu.value?.hide()
  identityAccessStore.logout()
  resetUiStores()
  toast.add({
    severity: 'success',
    summary: t('auth.logoutSuccessTitle'),
    detail: t('auth.logoutSuccessDetail'),
    life: 3000,
  })
  await router.push('/login')
}
</script>

<template>
  <header class="bt-enterprise-topbar" role="banner">
    <div class="bt-topbar-leading">
      <Button
        icon="pi pi-bars"
        text
        rounded
        class="bt-topbar-menu-button"
        :aria-label="t('app.openNavigation')"
        @click="$emit('toggle-navigation')"
      />
    </div>

    <div class="bt-topbar-actions">
      <Button
        icon="pi pi-bell"
        text
        rounded
        class="bt-topbar-icon-button"
        :aria-label="t('app.notifications')"
      />
      <LanguageSwitcher />
      <button
        type="button"
        class="bt-topbar-user-button"
        :aria-label="t('auth.userMenu', { name: userName || 'BioTrack' })"
        aria-haspopup="menu"
        @click="toggleUserMenu"
      >
        <Avatar
          :image="userAvatarUrl || undefined"
          :label="userAvatarUrl ? undefined : userInitials"
          :image-alt="userName || 'BioTrack'"
          shape="circle"
          class="bt-topbar-avatar"
        />
      </button>
      <Menu ref="userMenu" :model="menuItems" popup class="bt-user-menu">
        <template #start>
          <div class="bt-user-menu-header">
            <Avatar
              :image="userAvatarUrl || undefined"
              :label="userAvatarUrl ? undefined : userInitials"
              :image-alt="userName || 'BioTrack'"
              shape="circle"
              class="bt-user-menu-avatar"
            />
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
