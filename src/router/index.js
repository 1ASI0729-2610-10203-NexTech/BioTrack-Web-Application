import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../identity-access/presentation/pages/LoginPage.vue'
import RegisterPage from '../identity-access/presentation/pages/RegisterPage.vue'
import NotAuthorizedPage from '../shared/presentation/pages/NotAuthorizedPage.vue'
import PlaceholderPage from '../shared/presentation/pages/PlaceholderPage.vue'
import SubscriptionsBillingPage from '../subscriptions-billing/presentation/pages/SubscriptionsBillingPage.vue'

// Corporate Management
import CorporateDashboardPage from '../corporate-management/presentation/pages/CorporateDashboardPage.vue'
import CorporateRegisterPage from '../corporate-management/presentation/pages/CorporateRegisterPage.vue'
import CorporateCollaboratorsPage from '../corporate-management/presentation/pages/CorporateCollaboratorsPage.vue'
import CorporateMetricsPage from '../corporate-management/presentation/pages/CorporateMetricsPage.vue'

// Nutritional Planning
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

// Patient Profile
import PatientProfilePage from '../patient-profile/presentation/pages/PatientProfilePage.vue'
import HealthDataFormPage from '../patient-profile/presentation/pages/HealthDataFormPage.vue'
import NutritionalGoalPage from '../patient-profile/presentation/pages/NutritionalGoalPage.vue'
import DietaryRestrictionsPage from '../patient-profile/presentation/pages/DietaryRestrictionsPage.vue'

// Progress Tracking
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

const corporateMeta = { requiresAuth: true, roles: ['ADMIN_CORPORATIVO'] }
const patientMeta = { requiresAuth: true, roles: ['PACIENTE'] }
const nutritionistMeta = { requiresAuth: true, roles: ['NUTRICIONISTA'] }

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

    // ── patient-profile BC ──────────────────────────────────────────────
    { path: '/patient-profile', component: PatientProfilePage, meta: patientMeta },
    { path: '/patient-profile/health-data', component: HealthDataFormPage, meta: patientMeta },
    { path: '/patient-profile/nutritional-goal', component: NutritionalGoalPage, meta: patientMeta },
    { path: '/patient-profile/restrictions', component: DietaryRestrictionsPage, meta: patientMeta },

    // ── progress-tracking BC ────────────────────────────────────────────
    { path: '/progress-tracking', component: ProgressTrackingPage, meta: patientMeta },
    { path: '/progress-tracking/activity', component: ActivityLogPage, meta: patientMeta },
    { path: '/progress-tracking/weight', component: WeightUpdatePage, meta: patientMeta },
    { path: '/food-log', component: FoodLogPage, meta: patientMeta },

    // ── subscriptions-billing BC ────────────────────────────────────────
    {
      path: '/subscriptions-billing',
      component: SubscriptionsBillingPage,
      meta: { requiresAuth: true, roles: ['PACIENTE', 'ADMIN_CORPORATIVO'] },
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
