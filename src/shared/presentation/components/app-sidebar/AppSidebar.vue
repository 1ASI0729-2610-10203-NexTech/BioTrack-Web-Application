<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
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
const identityAccessStore = useIdentityAccessStore()

const navigationItems = computed(() =>
  getSidebarNavigationByRole(identityAccessStore.currentUser?.role),
)

const currentUserName = computed(() => {
  const firstName = identityAccessStore.currentUser?.firstName ?? ''
  const lastName = identityAccessStore.currentUser?.lastName ?? ''
  const fullName = `${firstName} ${lastName}`.trim()
  return fullName || identityAccessStore.currentUser?.email || 'Usuario'
})
const currentUserRole = computed(() => identityAccessStore.currentUser?.role ?? '')
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
              :class="{ 'bt-sidebar-link--active': isActive(item.route) }"
              :to="item.route"
              :aria-label="item.label"
              :aria-current="isActive(item.route) ? 'page' : undefined"
              @click="$emit('navigate')"
            >
              <i :class="item.icon" aria-hidden="true" />
              <span>{{ item.label }}</span>
            </RouterLink>
            <p v-if="!navigationItems.length" class="bt-sidebar-empty">
              Sin accesos disponibles.
            </p>
          </nav>
        </ScrollPanel>
      </section>
    </div>

    <footer class="bt-sidebar-profile">
      <Avatar :label="currentUserInitials" shape="circle" class="bt-sidebar-avatar" />
      <div class="bt-sidebar-profile-copy">
        <strong>{{ currentUserName }}</strong>
        <span>{{ currentUserRole || 'Sin rol' }}</span>
      </div>
    </footer>
  </aside>
</template>
