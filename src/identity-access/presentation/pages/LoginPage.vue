<script setup>
import { computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Password from 'primevue/password'
import AuthLayout from '../../../shared/presentation/layouts/auth-layout/AuthLayout.vue'
import { useIdentityAccessStore } from '../../application/identity-access.store'
import { getDefaultRouteByRole } from '../../application/auth-redirects'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
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
  if (identityAccessStore.loading) return t('auth.enteringDashboard')
  if (identityAccessStore.isLoginBlocked) return t('auth.accountBlocked')
  if (identityAccessStore.loginAttempts > 0) {
    return t('auth.retryAttempts', { count: identityAccessStore.loginAttempts })
  }
  return t('auth.enter')
})

function validateForm() {
  validation.email = ''
  validation.password = ''

  const email = form.email.trim()

  if (!email) validation.email = t('auth.emailRequired')
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    validation.email = t('auth.emailInvalid')
  }

  if (!form.password) validation.password = t('auth.passwordRequired')

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
        <h1 class="bt-auth-title">{{ t('auth.loginTitle') }}</h1>
        <p class="bt-auth-subtitle">{{ t('auth.loginSubtitle') }}</p>
      </header>

      <Message v-if="hasErrorState" severity="error" class="bt-auth-message">
        <strong>{{ t('auth.invalidCredentialsTitle') }}</strong>
        <span>{{ identityAccessStore.loginStatus.message }}</span>
      </Message>

      <Message v-if="hasSuccessState" severity="success" class="bt-auth-message">
        <strong>{{ t('auth.loginSuccessTitle') }}</strong>
        <span>{{ identityAccessStore.loginStatus.message }}</span>
      </Message>

      <form class="bt-auth-form" :aria-label="t('auth.loginTitle')" @submit.prevent="submitLogin">
        <div class="bt-auth-field">
          <label for="login-email">{{ t('auth.email') }}</label>
          <InputText
            id="login-email"
            v-model="form.email"
            autocomplete="email"
            :placeholder="'auth.emailPlaceholder'"
            :invalid="Boolean(validation.email) || hasErrorState"
            :aria-invalid="Boolean(validation.email) || hasErrorState"
          />
          <p v-if="validation.email" class="bt-auth-helper">{{ validation.email }}</p>
        </div>

        <div class="bt-auth-field bt-auth-password">
          <label for="login-password">{{ t('auth.password') }}</label>
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
          <RouterLink class="bt-auth-inline-link" to="/login">{{ t('auth.forgotPassword') }}</RouterLink>
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
