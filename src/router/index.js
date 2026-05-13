import { createRouter, createWebHashHistory } from "vue-router";
import LoginPage from "../identity-access/presentation/pages/LoginPage.vue";
import RegisterPage from "../identity-access/presentation/pages/RegisterPage.vue";
import PatientProfilePage from "../patient-profile/presentation/pages/PatientProfilePage.vue";
import HealthDataFormPage from "../patient-profile/presentation/pages/HealthDataFormPage.vue";
import NutritionalGoalPage from "../patient-profile/presentation/pages/NutritionalGoalPage.vue";
import DietaryRestrictionsPage from "../patient-profile/presentation/pages/DietaryRestrictionsPage.vue";
import CorporateDashboardPage from "../corporate-management/presentation/pages/CorporateDashboardPage.vue";
import PatientDashboardPage from "../nutritional-planning/presentation/pages/PatientDashboardPage.vue";
import NutritionalPlanPage from "../nutritional-planning/presentation/pages/NutritionalPlanPage.vue";
import WeeklyDietPage from "../nutritional-planning/presentation/pages/WeeklyDietPage.vue";
import ProgressTrackingPage from "../progress-tracking/presentation/pages/ProgressTrackingPage.vue";
import FoodLogPage from "../progress-tracking/presentation/pages/FoodLogPage.vue";
import ActivityLogPage from "../progress-tracking/presentation/pages/ActivityLogPage.vue";
import WeightUpdatePage from "../progress-tracking/presentation/pages/WeightUpdatePage.vue";
import SubscriptionsBillingPage from "../subscriptions-billing/presentation/pages/SubscriptionsBillingPage.vue";
import PlaceholderPage from "../shared/presentation/pages/PlaceholderPage.vue";
import NotAuthorizedPage from "../shared/presentation/pages/NotAuthorizedPage.vue";
import { useIdentityAccessStore } from "../identity-access/application/identity-access.store";
import { getDefaultRouteByRole } from "../identity-access/application/auth-redirects";

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", redirect: "/dashboard" },
    {
      path: "/login",
      component: LoginPage,
      meta: { layout: "public", guestOnly: true },
    },
    {
      path: "/register",
      component: RegisterPage,
      meta: { layout: "public", guestOnly: true },
    },
    {
      path: "/dashboard",
      component: PatientDashboardPage,
      meta: { requiresAuth: true, roles: ["PACIENTE"] },
    },
    {
      path: "/patient-profile",
      component: PatientProfilePage,
      meta: { requiresAuth: true, roles: ["PACIENTE"] },
    },
    {
      path: "/patient-profile/health-data",
      component: HealthDataFormPage,
      meta: { requiresAuth: true, roles: ["PACIENTE"] },
    },
    {
      path: "/patient-profile/nutritional-goal",
      component: NutritionalGoalPage,
      meta: { requiresAuth: true, roles: ["PACIENTE"] },
    },
    {
      path: "/patient-profile/restrictions",
      component: DietaryRestrictionsPage,
      meta: { requiresAuth: true, roles: ["PACIENTE"] },
    },
    {
      path: "/corporate-dashboard",
      component: CorporateDashboardPage,
      meta: { requiresAuth: true, roles: ["ADMIN_CORPORATIVO"] },
    },
    {
      path: "/collaborators",
      component: PlaceholderPage,
      props: { title: "Colaboradores", eyebrow: "Admin corporativo" },
      meta: { requiresAuth: true, roles: ["ADMIN_CORPORATIVO"] },
    },
    {
      path: "/corporate-metrics",
      component: PlaceholderPage,
      props: { title: "Metricas corporativas", eyebrow: "Admin corporativo" },
      meta: { requiresAuth: true, roles: ["ADMIN_CORPORATIVO"] },
    },
    {
      path: "/nutritionist-dashboard",
      component: PlaceholderPage,
      props: { title: "Dashboard del nutricionista", eyebrow: "Nutricionista" },
      meta: { requiresAuth: true, roles: ["NUTRICIONISTA"] },
    },
    {
      path: "/patients",
      component: PlaceholderPage,
      props: { title: "Mis pacientes", eyebrow: "Nutricionista" },
      meta: { requiresAuth: true, roles: ["NUTRICIONISTA"] },
    },
    {
      path: "/nutritionist-plans",
      component: PlaceholderPage,
      props: { title: "Planes nutricionales", eyebrow: "Nutricionista" },
      meta: { requiresAuth: true, roles: ["NUTRICIONISTA"] },
    },
    {
      path: "/consultations",
      component: PlaceholderPage,
      props: { title: "Consultas", eyebrow: "BioTrack" },
      meta: { requiresAuth: true, roles: ["PACIENTE", "NUTRICIONISTA"] },
    },
    {
      path: "/adherence-alerts",
      component: PlaceholderPage,
      props: { title: "Alertas de adherencia", eyebrow: "Nutricionista" },
      meta: { requiresAuth: true, roles: ["NUTRICIONISTA"] },
    },
    {
      path: "/reports",
      component: PlaceholderPage,
      props: { title: "Reportes", eyebrow: "Nutricionista" },
      meta: { requiresAuth: true, roles: ["NUTRICIONISTA"] },
    },
    {
      path: "/nutritional-plan",
      component: NutritionalPlanPage,
      meta: { requiresAuth: true, roles: ["PACIENTE"] },
    },
    {
      path: "/weekly-diet",
      component: WeeklyDietPage,
      meta: { requiresAuth: true, roles: ["PACIENTE"] },
    },
    {
      path: "/progress-tracking",
      component: ProgressTrackingPage,
      meta: { requiresAuth: true, roles: ["PACIENTE"] },
    },
    {
      path: "/progress-tracking/activity",
      component: ActivityLogPage,
      meta: { requiresAuth: true, roles: ["PACIENTE"] },
    },
    {
      path: "/progress-tracking/weight",
      component: WeightUpdatePage,
      meta: { requiresAuth: true, roles: ["PACIENTE"] },
    },
    {
      path: "/food-log",
      component: FoodLogPage,
      meta: { requiresAuth: true, roles: ["PACIENTE"] },
    },
    {
      path: "/subscriptions-billing",
      component: SubscriptionsBillingPage,
      meta: {
        requiresAuth: true,
        roles: ["PACIENTE", "ADMIN_CORPORATIVO"],
      },
    },
    {
      path: "/not-authorized",
      component: NotAuthorizedPage,
      meta: { requiresAuth: true },
    },
  ],
});

router.beforeEach((to) => {
  const identityAccessStore = useIdentityAccessStore();
  const hasAuthenticatedUser = identityAccessStore.isAuthenticated;
  const userRole = identityAccessStore.role;

  if (to.meta.requiresAuth && !hasAuthenticatedUser) {
    return {
      path: "/login",
      query: { redirect: to.fullPath },
    };
  }

  if (to.meta.guestOnly && hasAuthenticatedUser) {
    return getDefaultRouteByRole(userRole);
  }

  if (
    to.path !== "/not-authorized" &&
    to.meta.roles?.length &&
    !to.meta.roles.includes(userRole)
  ) {
    return "/not-authorized";
  }

  return true;
});

export default router;
