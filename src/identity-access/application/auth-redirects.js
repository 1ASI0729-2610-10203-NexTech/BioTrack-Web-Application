export function getDefaultRouteByRole(role) {
  if (role === 'PACIENTE') return '/dashboard'
  if (role === 'NUTRICIONISTA') return '/nutritionist-dashboard'
  if (role === 'ADMIN_CORPORATIVO') return '/corporate-dashboard'
  return '/login'
}
