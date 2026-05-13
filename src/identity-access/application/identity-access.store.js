import { defineStore } from 'pinia'
import { syncNutritionAccessForUser } from '../../subscriptions-billing/application/subscription-nutrition-access.service'
import { identityAccessApiService } from '../infrastructure/identity-access-api.service'

const SESSION_STORAGE_KEY = 'biotrack.mock-session'
const LEGACY_SESSION_KEYS = ['currentUser', 'authSession', 'token', 'accessToken', 'mockToken']

function persistSession(user) {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user))
}

function mapSessionUser(user, currentUser = {}) {
  const [firstName = user.name, ...lastNameParts] = String(user.name ?? '').split(' ')
  return {
    ...currentUser,
    id: user.id,
    email: user.email,
    role: user.role,
    firstName,
    lastName: lastNameParts.join(' '),
    name: user.name,
    status: user.status,
    emailVerified: user.emailVerified,
  }
}

function createIdleRegisterState() {
  return {
    status: 'idle',
    message: '',
  }
}

function createIdleLoginState() {
  return {
    status: 'idle',
    message: '',
  }
}

export const useIdentityAccessStore = defineStore('identity-access', {
  state: () => {
    const storedSession = JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY) ?? 'null')
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
      const matchedUser = await identityAccessApiService.login(credentials)

      if (!matchedUser) {
        this.loginAttempts += 1
        this.loading = false
        this.isAuthenticated = false
        this.currentUser = null
        this.role = null
        this.error =
          this.loginAttempts >= 5
            ? 'Cuenta bloqueada temporalmente por demasiados intentos.'
            : `Email o contrasena invalidos. Intento ${this.loginAttempts} de 5.`
        this.loginStatus = {
          status: 'error',
          message: this.error,
        }
        return false
      }

      this.currentUser = mapSessionUser(matchedUser)
      this.role = matchedUser.role
      this.isAuthenticated = true
      persistSession(this.currentUser)
      this.loginAttempts = 0
      this.loading = false
      this.loginStatus = {
        status: 'success',
        message: 'Redirigiendo al Dashboard Principal...',
      }
      return true
    },
    async register(command) {
      this.loading = true
      this.error = ''
      const createdUser = await identityAccessApiService.register(command)
      this.loading = false
      this.registerStatus = {
        status: 'success',
        message: 'Tu cuenta fue creada. Hemos enviado un correo de verificacion.',
      }
      return createdUser
    },
    async verifyEmail() {
      if (!this.currentUser?.id) {
        this.error = 'No hay un usuario autenticado para verificar.'
        return false
      }

      this.loading = true
      this.error = ''
      try {
        const updatedUser = await identityAccessApiService.verifyEmail(this.currentUser.id)
        this.currentUser = mapSessionUser(updatedUser, this.currentUser)
        this.role = updatedUser.role
        this.isAuthenticated = true
        persistSession(this.currentUser)
        await syncNutritionAccessForUser(updatedUser.id)
        return true
      } catch (error) {
        this.error = 'No se pudo verificar el correo.'
        throw error
      } finally {
        this.loading = false
      }
    },
    async refreshCurrentUser() {
      if (!this.currentUser?.id) return null
      try {
        const updatedUser = await identityAccessApiService.fetchUserById(this.currentUser.id)
        this.currentUser = mapSessionUser(updatedUser, this.currentUser)
        this.role = updatedUser.role
        this.isAuthenticated = true
        persistSession(this.currentUser)
        return this.currentUser
      } catch {
        return this.currentUser
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
      localStorage.removeItem(SESSION_STORAGE_KEY)
      LEGACY_SESSION_KEYS.forEach((key) => {
        localStorage.removeItem(key)
        sessionStorage.removeItem(key)
      })
    },
  },
})
