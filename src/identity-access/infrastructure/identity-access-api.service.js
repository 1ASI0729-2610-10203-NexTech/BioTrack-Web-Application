import { apiService } from '../../shared/infrastructure/api.service'
import { UserAssembler } from './user.assembler'

export const identityAccessApiService = {
  async login(credentials) {
    const payload = await apiService.post('/identity-access/login', credentials)
    return {
      accessToken: payload.access_token,
      session: payload.session,
      user: UserAssembler.fromApi(payload.user),
    }
  },

  async register(command) {
    const payload = await apiService.post('/identity-access/register', command)
    return UserAssembler.fromApi(payload.user)
  },
}
