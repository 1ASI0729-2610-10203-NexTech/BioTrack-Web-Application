import { apiService } from '../../shared/infrastructure/api.service'

export const identityAccessApiService = {
  async login(credentials) {
    const users = await apiService.get('/users', {
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

    return apiService.post('/users', {
      name: `${command.firstName} ${command.lastName}`.trim(),
      email: String(command.email ?? '').trim().toLowerCase(),
      password: command.password,
      role: requestedRole ?? 'PACIENTE',
      status: 'PENDING_VERIFICATION',
      emailVerified: false,
    })
  },

  async verifyEmail(userId) {
    return apiService.patch(`/users/${userId}`, {
      emailVerified: true,
      status: 'ACTIVE',
    })
  },

  async fetchUserById(userId) {
    return apiService.get(`/users/${userId}`)
  },
}
