import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../identity-access/presentation/pages/LoginPage.vue'
import RegisterPage from '../identity-access/presentation/pages/RegisterPage.vue'
import NotAuthorizedPage from '../shared/presentation/pages/NotAuthorizedPage.vue'
import PlaceholderPage from '../shared/presentation/pages/PlaceholderPage.vue'
import PatientDashboardPage from '../nutritional-planning/presentation/pages/PatientDashboardPage.vue'
import NutritionalPlanPage from '../nutritional-planning/presentation/pages/NutritionalPlanPage.vue'
import WeeklyDietPage from '../nutritional-planning/presentation/pages/WeeklyDietPage.vue'
import NutritionistDashboardPage from '../nutritional-planning/presentation/pages/NutritionistDashboardPage.vue'
import NutritionistPatientsPage from '../nutritional-planning/presentation/pages/NutritionistPatientsPage.vue'
import NutritionistPatientDetailPage from '../nutritional-planning/presentation/pages/NutritionistPatientDetailPage.vue'
import NutritionistEvaluationPage from '../nutritional-planning/presentation/pages/NutritionistEvaluationPage.vue'
import NutritionistPlansPage from '../nutritional-planning/presentation/pages/NutritionistPlansPage.vue'
import NutritionistCreatePlanPage from '../nutritional-planning/presentation/pages/NutritionistCreatePlanPage.vue'
import NutritionistFollowUpPage from '../nutritional-planning/presentation/pages/NutritionistFollowUpPage.vue'
import { useIdentityAccessStore } from '../identity-access/application/identity-access.store'
import { getDefaultRouteByRole } from '../identity-access/application/auth-redirects'

function resolveHomeRoute() {
  const identityAccessStore = useIdentityAccessStore()
  return identityAccessStore.isAuthenticated
    ? getDefaultRouteByRole(identityAccessStore.role)
    : '/login'
}

const patientMeta = { requiresAuth: true, roles: ['PACIENTE'] }
const nutritionistMeta = { requiresAuth: true, roles: ['NUTRICIONISTA'] }

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: resolveHomeRoute },
    { path: '/login', component: LoginPage, meta: { layout: 'public', guestOnly: true } },
    { path: '/register', component: RegisterPage, meta: { layout: 'public', guestOnly: true } },

    // ── nutritional-planning BC ─────────────────────────────────────────
    { path: '/dashboard', component: PatientDashboardPage, meta: patientMeta },
    { path: '/nutritional-plan', component: NutritionalPlanPage, meta: patientMeta },
    { path: '/weekly-diet', component: WeeklyDietPage, meta: patientMeta },
    { path: '/nutritionist-dashboard', component: NutritionistDashboardPage, meta: nutritionistMeta },
    { path: '/nutritionist-patients', component: NutritionistPatientsPage, meta: nutritionistMeta },
    { path: '/patients', redirect: '/nutritionist-patients' },
    { path: '/nutritionist-patients/:id', component: NutritionistPatientDetailPage, meta: nutritionistMeta },
    { path: '/nutritionist-evaluations/:patientId', component: NutritionistEvaluationPage, meta: nutritionistMeta },
    { path: '/nutritionist-plans', component: NutritionistPlansPage, meta: nutritionistMeta },
    { path: '/nutritionist-plans/create/:patientId', component: NutritionistCreatePlanPage, meta: nutritionistMeta },
    { path: '/nutritionist-follow-up/:patientId', component: NutritionistFollowUpPage, meta: nutritionistMeta },
    {
      path: '/consultations',
      component: PlaceholderPage,
      props: { titleKey: 'placeholders.consultations', eyebrowKey: 'placeholders.biotrack' },
      meta: { requiresAuth: true, roles: ['PACIENTE', 'NUTRICIONISTA'] },
    },
    {
      path: '/adherence-alerts',
      component: PlaceholderPage,
      props: { titleKey: 'placeholders.adherenceAlerts', eyebrowKey: 'placeholders.nutritionist' },
      meta: nutritionistMeta,
    },
    {
      path: '/reports',
      component: PlaceholderPage,
      props: { titleKey: 'placeholders.reports', eyebrowKey: 'placeholders.nutritionist' },
      meta: nutritionistMeta,
    },

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
