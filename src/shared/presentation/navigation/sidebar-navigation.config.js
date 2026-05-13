export const sidebarNavigationByRole = {
  PACIENTE: [
    { label: 'Dashboard', icon: 'pi pi-home', route: '/dashboard' },
    { label: 'Mi Perfil', icon: 'pi pi-user', route: '/patient-profile' },
    { label: 'Plan Nutricional', icon: 'pi pi-check-square', route: '/nutritional-plan' },
    { label: 'Mi Progreso', icon: 'pi pi-chart-bar', route: '/progress-tracking' },
    { label: 'Registrar Consumo', icon: 'pi pi-plus-circle', route: '/food-log' },
    { label: 'Facturacion', icon: 'pi pi-credit-card', route: '/subscriptions-billing' },
  ],
  ADMIN_CORPORATIVO: [
    { label: 'Dashboard', icon: 'pi pi-home', route: '/corporate-dashboard' },
    { label: 'Registrar Empresa', icon: 'pi pi-building', route: '/corporate-register' },
    { label: 'Colaboradores', icon: 'pi pi-users', route: '/collaborators' },
    { label: 'Metricas', icon: 'pi pi-chart-bar', route: '/corporate-metrics' },
    { label: 'Facturacion', icon: 'pi pi-credit-card', route: '/subscriptions-billing' },
  ],
  NUTRICIONISTA: [
    { label: 'Dashboard', icon: 'pi pi-home', route: '/nutritionist-dashboard' },
    { label: 'Mis Pacientes', icon: 'pi pi-users', route: '/patients' },
    { label: 'Planes Nutricionales', icon: 'pi pi-clipboard', route: '/nutritionist-plans' },
    { label: 'Consultas', icon: 'pi pi-calendar', route: '/consultations' },
    {
      label: 'Alertas de Adherencia',
      icon: 'pi pi-exclamation-triangle',
      route: '/adherence-alerts',
    },
    { label: 'Reportes', icon: 'pi pi-file-pdf', route: '/reports' },
  ],
}

export function getSidebarNavigationByRole(role) {
  return sidebarNavigationByRole[role] ?? []
}
