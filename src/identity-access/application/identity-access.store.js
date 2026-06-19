import { defineStore } from 'pinia'
import { apiService } from '../../shared/infrastructure/api.service'
import { identityAccessApiService } from '../infrastructure/identity-access-api.service'

const SESSION_STORAGE_KEY = 'biotrack.mock-session'
const TOKEN_STORAGE_KEY = 'biotrack.access-token'
const LEGACY_SESSION_KEYS = ['currentUser', 'authSession', 'token', 'accessToken', 'mockToken']

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
    name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
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
      role: storedSession?.role ?? null,
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
          message: 'Redirigiendo al Dashboard Principal...',
        }
        return true
      } catch {
        this.loginAttempts += 1
        this.isAuthenticated = false
        this.currentUser = null
        this.role = null
        this.error =
          this.loginAttempts >= 5
            ? 'Cuenta bloqueada temporalmente por demasiados intentos.'
            : `Email o contraseña inválidos. Intento ${this.loginAttempts} de 5.`
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
          message: 'Tu cuenta fue creada. Ya puedes iniciar sesión.',
        }
        return result
      } catch (err) {
        this.error = err?.message ?? 'Error al registrar la cuenta.'
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
