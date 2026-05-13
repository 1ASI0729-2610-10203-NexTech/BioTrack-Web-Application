import { defineStore } from 'pinia'

const mockUsers = [
  {
    email: 'paciente@biotrack.com',
    password: 'password123',
    role: 'PACIENTE',
    firstName: 'Juan',
    lastName: 'Perez',
  },
  {
    email: 'nutricionista@biotrack.com',
    password: 'password123',
    role: 'NUTRICIONISTA',
    firstName: 'Lucia',
    lastName: 'Ramos',
  },
  {
    email: 'admin@biotrack.com',
    password: 'password123',
    role: 'ADMIN_CORPORATIVO',
    firstName: 'Carlos',
    lastName: 'Rojas',
  },
]

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
  state: () => ({
    currentUser: null,
    isAuthenticated: false,
    role: null,
    loginStatus: createIdleLoginState(),
    registerStatus: createIdleRegisterState(),
    loginAttempts: 0,
    loading: false,
    error: '',
  }),
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

      await new Promise((resolve) => setTimeout(resolve, 700))

      const normalizedEmail = String(credentials.email ?? '').trim().toLowerCase()
      const matchedUser = mockUsers.find(
        (user) => user.email === normalizedEmail && user.password === credentials.password,
      )

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

      this.currentUser = {
        email: matchedUser.email,
        role: matchedUser.role,
        firstName: matchedUser.firstName,
        lastName: matchedUser.lastName,
      }
      this.role = matchedUser.role
      this.isAuthenticated = true
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
      await new Promise((resolve) => setTimeout(resolve, 500))
      this.loading = false
      this.registerStatus = {
        status: 'success',
        message: 'Tu cuenta fue creada. Hemos enviado un correo de verificacion.',
      }
      return {
        ...command,
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
    },
  },
})
