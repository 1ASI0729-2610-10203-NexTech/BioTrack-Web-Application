import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../identity-access/presentation/pages/LoginPage.vue'
import RegisterPage from '../identity-access/presentation/pages/RegisterPage.vue'
import NotAuthorizedPage from '../shared/presentation/pages/NotAuthorizedPage.vue'
import CorporateDashboardPage from '../corporate-management/presentation/pages/CorporateDashboardPage.vue'
import CorporateRegisterPage from '../corporate-management/presentation/pages/CorporateRegisterPage.vue'
import CorporateCollaboratorsPage from '../corporate-management/presentation/pages/CorporateCollaboratorsPage.vue'
import CorporateMetricsPage from '../corporate-management/presentation/pages/CorporateMetricsPage.vue'
import { useIdentityAccessStore } from '../identity-access/application/identity-access.store'
import { getDefaultRouteByRole } from '../identity-access/application/auth-redirects'

function resolveHomeRoute() {
  const identityAccessStore = useIdentityAccessStore()
  return identityAccessStore.isAuthenticated
    ? getDefaultRouteByRole(identityAccessStore.role)
    : '/login'
}

const corporateMeta = { requiresAuth: true, roles: ['ADMIN_CORPORATIVO'] }

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: resolveHomeRoute },
    { path: '/login', component: LoginPage, meta: { layout: 'public', guestOnly: true } },
    { path: '/register', component: RegisterPage, meta: { layout: 'public', guestOnly: true } },

    // ── corporate-management BC ─────────────────────────────────────────
    { path: '/corporate-dashboard', component: CorporateDashboardPage, meta: corporateMeta },
    { path: '/corporate-register', component: CorporateRegisterPage, meta: corporateMeta },
    { path: '/collaborators', component: CorporateCollaboratorsPage, meta: corporateMeta },
    { path: '/corporate-metrics', component: CorporateMetricsPage, meta: corporateMeta },

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
