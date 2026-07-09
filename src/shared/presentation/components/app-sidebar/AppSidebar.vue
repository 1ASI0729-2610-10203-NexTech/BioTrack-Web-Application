<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Avatar from 'primevue/avatar'
import ScrollPanel from 'primevue/scrollpanel'
import { useIdentityAccessStore } from '../../../../identity-access/application/identity-access.store'
import { getSidebarNavigationByRole } from '../../navigation/sidebar-navigation.config'

defineProps({
  drawer: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['navigate'])

const route = useRoute()
const { t } = useI18n()
const identityAccessStore = useIdentityAccessStore()
const DEFAULT_AVATAR_URL = 'https://i.pravatar.cc/150?img=33'

const navigationItems = computed(() =>
  getSidebarNavigationByRole(identityAccessStore.currentUser?.role),
)

const currentUserName = computed(() => {
  if (identityAccessStore.currentUser?.name) return identityAccessStore.currentUser.name
  const firstName = identityAccessStore.currentUser?.firstName ?? ''
  const lastName = identityAccessStore.currentUser?.lastName ?? ''
  const fullName = `${firstName} ${lastName}`.trim()
  return fullName || t('auth.user')
})
const currentUserAvatarUrl = computed(() =>
  identityAccessStore.currentUser ? identityAccessStore.currentUser.avatarUrl || DEFAULT_AVATAR_URL : '',
)
const currentUserRole = computed(() => identityAccessStore.currentUser?.role ?? '')
const currentUserRoleLabel = computed(() =>
  t(`roles.${currentUserRole.value || 'USUARIO'}`),
)
const currentUserInitials = computed(() => {
  const firstName = identityAccessStore.currentUser?.firstName ?? ''
  const lastName = identityAccessStore.currentUser?.lastName ?? ''
  const email = identityAccessStore.currentUser?.email ?? 'BT'

  if (firstName || lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  return email.slice(0, 2).toUpperCase()
})

function isActive(routePath) {
  return route.path === routePath
}

function getItemLabel(item) {
  return item.labelKey ? t(item.labelKey) : item.label
}
</script>

<template>
  <aside
    class="bt-enterprise-sidebar"
    :class="{ 'bt-enterprise-sidebar--drawer': drawer }"
    :aria-label="t('app.mainNavigation')"
  >
    <div class="bt-sidebar-top">
      <RouterLink class="bt-brand-mark" to="/corporate-dashboard" @click="$emit('navigate')">
        <img src="../../../../assets/logo.png" alt="BioTrack" class="bt-brand-logo" />
      </RouterLink>

      <section class="bt-sidebar-menu">

        <ScrollPanel class="bt-sidebar-scroll">
          <nav class="bt-sidebar-nav" :aria-label="t('app.mainNavigation')">
            <RouterLink
              v-for="item in navigationItems"
              :key="item.route"
              v-ripple
              class="bt-sidebar-link"
              :class="{ 'bt-sidebar-link--active': isActive(item.route) }"
              :to="item.route"
              :aria-label="getItemLabel(item)"
              :aria-current="isActive(item.route) ? 'page' : undefined"
              @click="$emit('navigate')"
            >
              <i :class="item.icon" aria-hidden="true" />
              <span>{{ getItemLabel(item) }}</span>
            </RouterLink>
            <p v-if="!navigationItems.length" class="bt-sidebar-empty">
              {{ t('app.noNavigation') }}
            </p>
          </nav>
        </ScrollPanel>
      </section>
    </div>

    <footer class="bt-sidebar-profile">
      <Avatar
        :image="currentUserAvatarUrl || undefined"
        :label="currentUserAvatarUrl ? undefined : currentUserInitials"
        :image-alt="currentUserName"
        shape="circle"
        class="bt-sidebar-avatar"
      />
      <div class="bt-sidebar-profile-copy">
        <strong>{{ currentUserName }}</strong>
        <span>{{ currentUserRoleLabel }}</span>
      </div>
    </footer>
  </aside>
</template>
