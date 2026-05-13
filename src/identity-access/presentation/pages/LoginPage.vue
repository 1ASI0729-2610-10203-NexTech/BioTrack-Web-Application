<script setup>
import { computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Password from 'primevue/password'
import AuthLayout from '../../../shared/presentation/layouts/auth-layout/AuthLayout.vue'
import { useIdentityAccessStore } from '../../application/identity-access.store'
import { getDefaultRouteByRole } from '../../application/auth-redirects'

const router = useRouter()
const route = useRoute()
const identityAccessStore = useIdentityAccessStore()

const form = reactive({
  email: '',
  password: '',
})

const validation = reactive({
  email: '',
  password: '',
})

const hasErrorState = computed(() => identityAccessStore.loginStatus.status === 'error')
const hasSuccessState = computed(() => identityAccessStore.loginStatus.status === 'success')
const buttonLabel = computed(() => {
  if (identityAccessStore.loading) return 'Ingresando al dashboard...'
  if (identityAccessStore.isLoginBlocked) return 'Cuenta bloqueada'
  if (identityAccessStore.loginAttempts > 0) {
    return `Reintentar (${identityAccessStore.loginAttempts}/5 intentos)`
  }
  return 'Ingresar'
})

function validateForm() {
  validation.email = ''
  validation.password = ''

  const email = form.email.trim()

  if (!email) validation.email = 'El correo electronico es obligatorio.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    validation.email = 'Ingresa un correo electronico valido.'
  }

  if (!form.password) validation.password = 'La contrasena es obligatoria.'

  return !validation.email && !validation.password
}

async function submitLogin() {
  identityAccessStore.resetLoginFeedback()
  if (!validateForm() || identityAccessStore.isLoginBlocked) return

  const success = await identityAccessStore.login(form)
  if (!success) return

  window.setTimeout(() => {
    const fallbackRoute = getDefaultRouteByRole(identityAccessStore.role)
    const redirectRoute =
      typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/')
        ? route.query.redirect
        : fallbackRoute

    router.push(redirectRoute)
  }, 700)
}
</script>

<template>
  <AuthLayout mode="login">
    <section
      class="bt-auth-card"
      :class="{ 'bt-auth-error': hasErrorState, 'bt-auth-success': hasSuccessState }"
    >
      <header>
        <p class="bt-auth-kicker">USR1 - Escenario 0 - Credenciales validas</p>
        <h1 class="bt-auth-title">Iniciar sesion</h1>
        <p class="bt-auth-subtitle">Ingresa tus credenciales para acceder.</p>
      </header>

      <Message v-if="hasErrorState" severity="error" class="bt-auth-message">
        <strong>Credenciales incorrectas</strong>
        <span>{{ identityAccessStore.loginStatus.message }}</span>
      </Message>

      <Message v-if="hasSuccessState" severity="success" class="bt-auth-message">
        <strong>Inicio de sesion exitoso</strong>
        <span>{{ identityAccessStore.loginStatus.message }}</span>
      </Message>

      <form class="bt-auth-form" @submit.prevent="submitLogin">
        <div class="bt-auth-field">
          <label for="login-email">Correo electronico</label>
          <InputText
            id="login-email"
            v-model="form.email"
            autocomplete="email"
            placeholder="juan.perez@gmail.com"
            :invalid="Boolean(validation.email) || hasErrorState"
            :aria-invalid="Boolean(validation.email) || hasErrorState"
          />
          <p v-if="validation.email" class="bt-auth-helper">{{ validation.email }}</p>
        </div>

        <div class="bt-auth-field bt-auth-password">
          <label for="login-password">Contrasena</label>
          <Password
            input-id="login-password"
            v-model="form.password"
            toggle-mask
            :feedback="false"
            placeholder="********"
            :invalid="Boolean(validation.password) || hasErrorState"
            :aria-invalid="Boolean(validation.password) || hasErrorState"
          />
          <p v-if="validation.password" class="bt-auth-helper">{{ validation.password }}</p>
          <RouterLink class="bt-auth-inline-link" to="/login">¿Olvidaste tu contrasena?</RouterLink>
        </div>

        <div class="bt-auth-actions">
          <Button
            class="bt-auth-button"
            :label="buttonLabel"
            :loading="identityAccessStore.loading"
            :disabled="identityAccessStore.loading || identityAccessStore.isLoginBlocked"
            type="submit"
          />
        </div>
      </form>
    </section>
  </AuthLayout>
</template>
