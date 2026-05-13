import { defineStore } from 'pinia'
import { identityAccessApiService } from '../infrastructure/identity-access-api.service'
import { apiService } from '../../shared/infrastructure/api.service'

export const useIdentityAccessStore = defineStore('identity-access', {
  state: () => ({
    user: null,
    session: null,
    accessToken: null,
    status: 'idle',
  }),
  actions: {
    async login(credentials) {
      this.status = 'loading'
      const response = await identityAccessApiService.login(credentials)
      this.user = response.user
      this.session = response.session
      this.accessToken = response.accessToken
      apiService.setAccessToken(response.accessToken)
      this.status = 'authenticated'
    },
    async register(command) {
      this.status = 'loading'
      this.user = await identityAccessApiService.register(command)
      this.status = 'registered'
    },
  },
})
