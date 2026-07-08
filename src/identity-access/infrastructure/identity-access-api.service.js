import { apiService } from '../../shared/infrastructure/api.service'

export const identityAccessApiService = {
  // POST /api/v1/auth/tokens
  async login(credentials) {
    return apiService.post('/auth/tokens', {
      email: String(credentials.email ?? '').trim().toLowerCase(),
      password: credentials.password,
    })
  },

  // POST /api/v1/users
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

    return apiService.post('/users', {
      firstName: command.firstName,
      lastName: command.lastName,
      email: String(command.email ?? '').trim().toLowerCase(),
      password: command.password,
      role: requestedRole ?? 'PACIENTE',
    })
  },

  // POST /api/v1/auth/email-verifications
  async verifyEmail(token) {
    return apiService.post('/auth/email-verifications', { token })
  },

  async fetchUserById(userId) {
    return apiService.get(`/users/${userId}`)
  },
}
