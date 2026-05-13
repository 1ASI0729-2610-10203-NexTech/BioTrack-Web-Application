import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../identity-access/presentation/pages/LoginPage.vue'
import RegisterPage from '../identity-access/presentation/pages/RegisterPage.vue'
import PatientProfilePage from '../patient-profile/presentation/pages/PatientProfilePage.vue'
import CorporateDashboardPage from '../corporate-management/presentation/pages/CorporateDashboardPage.vue'
import NutritionalPlanningPage from '../nutritional-planning/presentation/pages/NutritionalPlanningPage.vue'
import ProgressTrackingPage from '../progress-tracking/presentation/pages/ProgressTrackingPage.vue'
import SubscriptionsBillingPage from '../subscriptions-billing/presentation/pages/SubscriptionsBillingPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/patient-profile' },
    { path: '/login', component: LoginPage },
    { path: '/register', component: RegisterPage },
    { path: '/patient-profile', component: PatientProfilePage },
    { path: '/corporate-dashboard', component: CorporateDashboardPage },
    { path: '/nutritional-planning', component: NutritionalPlanningPage },
    { path: '/progress-tracking', component: ProgressTrackingPage },
    { path: '/subscriptions-billing', component: SubscriptionsBillingPage },
  ],
})

export default router
