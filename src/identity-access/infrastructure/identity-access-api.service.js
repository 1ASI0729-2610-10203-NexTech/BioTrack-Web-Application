import { apiService } from '../../shared/infrastructure/api.service'

export const identityAccessApiService = {
  // TS02 — POST /api/v1/auth/login
  async login(credentials) {
    return apiService.post('/auth/login', {
      email: String(credentials.email ?? '').trim().toLowerCase(),
      password: credentials.password,
    })
  },

  // TS01 — POST /api/v1/users/register
  async register(command) {
    const roleByAccountType = {
      paciente: 'PACIENTE',
      nutricionista: 'NUTRICIONISTA',
      corporativo: 'ADMIN_CORPORATIVO',
    }
    const validRoles = ['PACIENTE', 'NUTRICIONISTA', 'ADMIN_CORPORATIVO']
    const requestedRole = validRoles.includes(command.role)
      ? command.role
      : roleByAccountType[command.accountType]

    return apiService.post('/users/register', {
      firstName: command.firstName,
      lastName: command.lastName,
      email: String(command.email ?? '').trim().toLowerCase(),
      password: command.password,
      role: requestedRole ?? 'PACIENTE',
    })
  },

  // TS03 — GET /api/v1/auth/verify-email?token={token}
  async verifyEmail(token) {
    return apiService.get('/auth/verify-email', { params: { token } })
  },

  async fetchUserById(userId) {
    return apiService.get(`/users/${userId}`)
  },
}
