import { apiService } from '../../shared/infrastructure/api.service'

const jsonServerBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1')
  .replace(/\/api\/v1\/?$/, '')
  .replace(/\/$/, '')

export const identityAccessApiService = {
  async login(credentials) {
    const users = await apiService.get(`${jsonServerBaseUrl}/users`, {
      params: {
        email: String(credentials.email ?? '').trim().toLowerCase(),
        password: credentials.password,
      },
    })

    return users[0] ?? null
  },

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

    return apiService.post(`${jsonServerBaseUrl}/users`, {
      name: `${command.firstName} ${command.lastName}`.trim(),
      email: String(command.email ?? '').trim().toLowerCase(),
      password: command.password,
      role: requestedRole ?? 'PACIENTE',
      status: 'PENDING_VERIFICATION',
      emailVerified: false,
    })
  },

  async verifyEmail(userId) {
    return apiService.patch(`${jsonServerBaseUrl}/users/${userId}`, {
      emailVerified: true,
      status: 'ACTIVE',
    })
  },

  async fetchUserById(userId) {
    return apiService.get(`${jsonServerBaseUrl}/users/${userId}`)
  },
}
