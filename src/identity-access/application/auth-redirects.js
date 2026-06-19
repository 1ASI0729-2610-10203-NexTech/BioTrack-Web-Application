export function getDefaultRouteByRole(role) {
  if (role === 'PACIENTE' || role === 'PATIENT') return '/dashboard'
  if (role === 'NUTRICIONISTA' || role === 'NUTRITIONIST') return '/nutritionist-dashboard'
  if (role === 'ADMIN_CORPORATIVO' || role === 'ADMIN') return '/corporate-dashboard'
  return '/dashboard'
}
