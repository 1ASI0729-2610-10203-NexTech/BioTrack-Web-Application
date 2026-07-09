import { apiService } from '../../shared/infrastructure/api.service'

const DEFAULT_AVATAR_URL = 'https://i.pravatar.cc/150?img=33'
const DEFAULT_SUBSCRIPTION_PLAN_ID = 'free'

export const identityAccessApiService = {
  // TS02 — POST /api/v1/auth/login
  async login(credentials) {
    const email = String(credentials.email ?? '').trim().toLowerCase()
    const password = credentials.password
    const users = await apiService.get('/users', {
      params: { email, password },
    })

    const user = Array.isArray(users) ? users[0] : null
    if (!user) throw new Error('Invalid credentials')

    const [firstName = '', ...lastNameParts] = String(user.name ?? '').split(' ')
    return {
      ...user,
      firstName: user.firstName ?? firstName,
      lastName: user.lastName ?? lastNameParts.join(' '),
      avatarUrl: user.avatarUrl ?? DEFAULT_AVATAR_URL,
      token: `mock-token-${user.id}`,
    }
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

    const createdUser = await apiService.post('/users/register', {
      firstName: command.firstName,
      lastName: command.lastName,
      name: `${command.firstName ?? ''} ${command.lastName ?? ''}`.trim(),
      email: String(command.email ?? '').trim().toLowerCase(),
      password: command.password,
      role: requestedRole ?? 'PACIENTE',
      status: 'ACTIVE',
      emailVerified: true,
      avatarUrl: DEFAULT_AVATAR_URL,
    })

    await apiService.post('/subscriptions', {
      userId: createdUser.id,
      planId: DEFAULT_SUBSCRIPTION_PLAN_ID,
      status: 'ACTIVE',
      startedAt: new Date().toISOString().slice(0, 10),
      nextRenewalAt: null,
    })

    return createdUser
  },

  // TS03 — GET /api/v1/auth/verify-email?token={token}
  async verifyEmail(token) {
    return apiService.get('/auth/verify-email', { params: { token } })
  },

  async fetchUserById(userId) {
    return apiService.get(`/users/${userId}`)
  },
}
