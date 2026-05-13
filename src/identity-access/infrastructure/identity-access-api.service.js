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

    return apiService.post('/users', {
      name: `${command.firstName} ${command.lastName}`.trim(),
      email: String(command.email ?? '').trim().toLowerCase(),
      password: command.password,
      role: roleByAccountType[command.accountType] ?? 'PACIENTE',
      status: 'PENDING_VERIFICATION',
      emailVerified: false,
    })
  },
}
