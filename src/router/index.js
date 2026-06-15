import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../identity-access/presentation/pages/LoginPage.vue'
import RegisterPage from '../identity-access/presentation/pages/RegisterPage.vue'
import NotAuthorizedPage from '../shared/presentation/pages/NotAuthorizedPage.vue'
import ProgressTrackingPage from '../progress-tracking/presentation/pages/ProgressTrackingPage.vue'
import FoodLogPage from '../progress-tracking/presentation/pages/FoodLogPage.vue'
import ActivityLogPage from '../progress-tracking/presentation/pages/ActivityLogPage.vue'
import WeightUpdatePage from '../progress-tracking/presentation/pages/WeightUpdatePage.vue'
import { useIdentityAccessStore } from '../identity-access/application/identity-access.store'
import { getDefaultRouteByRole } from '../identity-access/application/auth-redirects'

function resolveHomeRoute() {
  const identityAccessStore = useIdentityAccessStore()
  return identityAccessStore.isAuthenticated
    ? getDefaultRouteByRole(identityAccessStore.role)
    : '/login'
}

const patientMeta = { requiresAuth: true, roles: ['PACIENTE'] }

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: resolveHomeRoute },
    { path: '/login', component: LoginPage, meta: { layout: 'public', guestOnly: true } },
    { path: '/register', component: RegisterPage, meta: { layout: 'public', guestOnly: true } },

    // ── progress-tracking BC ────────────────────────────────────────────
    { path: '/progress-tracking', component: ProgressTrackingPage, meta: patientMeta },
    { path: '/progress-tracking/activity', component: ActivityLogPage, meta: patientMeta },
    { path: '/progress-tracking/weight', component: WeightUpdatePage, meta: patientMeta },
    { path: '/food-log', component: FoodLogPage, meta: patientMeta },

    { path: '/not-authorized', component: NotAuthorizedPage, meta: { requiresAuth: true } },
    { path: '/:pathMatch(.*)*', redirect: resolveHomeRoute },
  ],
})

router.beforeEach((to) => {
  const identityAccessStore = useIdentityAccessStore()
  const hasAuthenticatedUser = identityAccessStore.isAuthenticated
  const userRole = identityAccessStore.role

  if (to.meta.requiresAuth && !hasAuthenticatedUser) {
    return {
      path: '/login',
      query: to.fullPath !== '/login' ? { redirect: to.fullPath } : undefined,
    }
  }

  if (to.meta.guestOnly && hasAuthenticatedUser) {
    return getDefaultRouteByRole(userRole)
  }

  if (to.path !== '/not-authorized' && to.meta.roles?.length && !to.meta.roles.includes(userRole)) {
    return getDefaultRouteByRole(userRole)
  }

  return true
})

export default router
