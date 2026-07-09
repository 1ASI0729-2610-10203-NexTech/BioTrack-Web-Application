import { defineStore } from 'pinia'
import { apiService } from '../../shared/infrastructure/api.service'
import { t } from '../../locales'
import { identityAccessApiService } from '../infrastructure/identity-access-api.service'

const SESSION_STORAGE_KEY = 'biotrack.session'
const TOKEN_STORAGE_KEY = 'biotrack.access-token'
const LEGACY_SESSION_KEYS = ['biotrack.mock-session', 'currentUser', 'authSession', 'token', 'accessToken', 'mockToken']

function persistSession(user, token) {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user))
  if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

function mapSessionUser(user, currentUser = {}) {
  return {
    ...currentUser,
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    name: user.name ?? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
    avatarUrl: user.avatarUrl ?? '',
    status: user.status,
    emailVerified: user.emailVerified,
  }
}

function createIdleRegisterState() {
  return { status: 'idle', message: '' }
}

function createIdleLoginState() {
  return { status: 'idle', message: '' }
}

export const useIdentityAccessStore = defineStore('identity-access', {
  state: () => {
    const storedSession = JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY) ?? 'null')
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY)
    if (storedToken) apiService.setAccessToken(storedToken)
    return {
      currentUser: storedSession,
      isAuthenticated: Boolean(storedSession),
      role: storedSession?.role ? storedSession.role.toUpperCase() : null,
      loginStatus: createIdleLoginState(),
      registerStatus: createIdleRegisterState(),
      loginAttempts: 0,
      loading: false,
      error: '',
    }
  },
  getters: {
    currentUserRole(state) {
      return state.role
    },
    isLoginBlocked(state) {
      return state.loginAttempts >= 5
    },
    hasVerifiedAccount(state) {
      return Boolean(state.currentUser?.emailVerified) && state.currentUser?.status === 'ACTIVE'
    },
  },
  actions: {
    async login(credentials) {
      this.loading = true
      this.error = ''
      this.loginStatus = createIdleLoginState()

      try {
        const response = await identityAccessApiService.login(credentials)

        const sessionUser = mapSessionUser(response)
        this.currentUser = sessionUser
        this.role = response.role
        this.isAuthenticated = true
        this.loginAttempts = 0

        apiService.setAccessToken(response.token)
        persistSession(sessionUser, response.token)

        this.loginStatus = {
          status: 'success',
          message: t('auth.loginRedirecting'),
        }
        return true
      } catch {
        this.loginAttempts += 1
        this.isAuthenticated = false
        this.currentUser = null
        this.role = null
        this.error =
          this.loginAttempts >= 5
            ? t('auth.loginBlockedMessage')
            : t('auth.invalidCredentialsAttempt', { count: this.loginAttempts })
        this.loginStatus = { status: 'error', message: this.error }
        return false
      } finally {
        this.loading = false
      }
    },

    async register(command) {
      this.loading = true
      this.error = ''
      try {
        const result = await identityAccessApiService.register(command)
        this.registerStatus = {
          status: 'success',
          message: t('auth.registerCreatedMessage'),
        }
        return result
      } catch (err) {
        this.error = err?.message ?? t('auth.registerErrorMessage')
        this.registerStatus = { status: 'error', message: this.error }
        throw err
      } finally {
        this.loading = false
      }
    },

    resetLoginFeedback() {
      this.error = ''
      this.loginStatus = createIdleLoginState()
    },

    resetRegisterFeedback() {
      this.error = ''
      this.registerStatus = createIdleRegisterState()
    },

    async refreshCurrentUser() {
      const userId = this.currentUser?.id
      if (!userId) return null
      try {
        const user = await identityAccessApiService.fetchUserById(userId)
        const updated = mapSessionUser(user, this.currentUser)
        this.currentUser = updated
        this.role = user.role
        persistSession(updated, localStorage.getItem(TOKEN_STORAGE_KEY))
        return updated
      } catch {
        return this.currentUser
      }
    },

    async verifyEmail() {
      if (!this.currentUser) return
      this.currentUser = { ...this.currentUser, emailVerified: true, status: 'ACTIVE' }
      persistSession(this.currentUser, localStorage.getItem(TOKEN_STORAGE_KEY))
    },

    logout() {
      this.currentUser = null
      this.isAuthenticated = false
      this.role = null
      this.loginStatus = createIdleLoginState()
      this.registerStatus = createIdleRegisterState()
      this.loginAttempts = 0
      this.loading = false
      this.error = ''
      apiService.setAccessToken(null)
      localStorage.removeItem(SESSION_STORAGE_KEY)
      localStorage.removeItem(TOKEN_STORAGE_KEY)
      LEGACY_SESSION_KEYS.forEach((key) => {
        localStorage.removeItem(key)
        sessionStorage.removeItem(key)
      })
    },
  },
})
