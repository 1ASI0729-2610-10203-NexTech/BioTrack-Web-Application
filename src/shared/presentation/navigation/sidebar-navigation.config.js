const patientNav = [
  { labelKey: 'navigation.dashboard', icon: 'pi pi-home', route: '/dashboard' },
  { labelKey: 'navigation.myProfile', icon: 'pi pi-user', route: '/patient-profile' },
  { labelKey: 'navigation.nutritionalPlan', icon: 'pi pi-check-square', route: '/nutritional-plan' },
  { labelKey: 'navigation.myProgress', icon: 'pi pi-chart-bar', route: '/progress-tracking' },
  { labelKey: 'navigation.foodLog', icon: 'pi pi-plus-circle', route: '/food-log' },
  { labelKey: 'navigation.billing', icon: 'pi pi-credit-card', route: '/subscriptions-billing' },
]

const corporateNav = [
  { labelKey: 'navigation.dashboard', icon: 'pi pi-home', route: '/corporate-dashboard' },
  { labelKey: 'navigation.collaborators', icon: 'pi pi-users', route: '/collaborators' },
  { labelKey: 'navigation.metrics', icon: 'pi pi-chart-bar', route: '/corporate-metrics' },
  { labelKey: 'navigation.billing', icon: 'pi pi-credit-card', route: '/subscriptions-billing' },
]

const nutritionistNav = [
  { labelKey: 'navigation.dashboard', icon: 'pi pi-home', route: '/nutritionist-dashboard' },
  { labelKey: 'navigation.myPatients', icon: 'pi pi-users', route: '/nutritionist-patients' },
  { labelKey: 'navigation.nutritionPlans', icon: 'pi pi-clipboard', route: '/nutritionist-plans' },
  { labelKey: 'navigation.consultations', icon: 'pi pi-calendar', route: '/consultations' },
  { labelKey: 'navigation.adherenceAlerts', icon: 'pi pi-exclamation-triangle', route: '/adherence-alerts' },
  { labelKey: 'navigation.reports', icon: 'pi pi-file-pdf', route: '/reports' },
]

export const sidebarNavigationByRole = {
  PACIENTE: patientNav,
  PATIENT: patientNav,
  ADMIN_CORPORATIVO: corporateNav,
  ADMIN: corporateNav,
  NUTRICIONISTA: nutritionistNav,
  NUTRITIONIST: nutritionistNav,
}

export function getSidebarNavigationByRole(role) {
  return sidebarNavigationByRole[role] ?? []
}
