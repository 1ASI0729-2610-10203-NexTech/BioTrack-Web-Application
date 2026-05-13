import { defineStore } from 'pinia'
import { identityAccessApiService } from '../infrastructure/identity-access-api.service'

const SESSION_STORAGE_KEY = 'biotrack.mock-session'

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

      const [firstName = matchedUser.name, ...lastNameParts] = String(matchedUser.name ?? '').split(' ')
      this.currentUser = {
        id: matchedUser.id,
        email: matchedUser.email,
        role: matchedUser.role,
        firstName,
        lastName: lastNameParts.join(' '),
        name: matchedUser.name,
      }
      this.role = matchedUser.role
      this.isAuthenticated = true
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(this.currentUser))
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
    },
  },
})
