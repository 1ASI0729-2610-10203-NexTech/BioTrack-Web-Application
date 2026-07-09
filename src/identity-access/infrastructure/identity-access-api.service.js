import { apiService } from '../../shared/infrastructure/api.service'

const DEFAULT_AVATAR_URL = 'https://i.pravatar.cc/150?img=33'

export const identityAccessApiService = {
  // TS02 — POST /api/v1/auth/tokens
  async login(credentials) {
    const email = String(credentials.email ?? '').trim().toLowerCase()
    const password = credentials.password
    const data = await apiService.post('/auth/tokens', { email, password })
    return {
      id: data.id,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      role: data.role,
      emailVerified: data.emailVerified,
      status: data.status,
      avatarUrl: DEFAULT_AVATAR_URL,
      token: data.token,
    }
  },

  // TS01 — POST /api/v1/users
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

  // TS03 — POST /api/v1/auth/email-verifications
  async verifyEmail(token) {
    return apiService.post('/auth/email-verifications', { token })
  },

  async fetchUserById(userId) {
    return apiService.get(`/users/${userId}`)
  },
}
