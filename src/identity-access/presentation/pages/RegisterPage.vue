<script setup>
import { computed, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Password from 'primevue/password'
import AuthLayout from '../../../shared/presentation/layouts/auth-layout/AuthLayout.vue'
import { useIdentityAccessStore } from '../../application/identity-access.store'

const identityAccessStore = useIdentityAccessStore()
const { t } = useI18n()

const accountOptions = computed(() => [
  { label: t('auth.patient'), value: 'PACIENTE' },
  { label: t('auth.nutritionist'), value: 'NUTRICIONISTA' },
  { label: t('auth.corporate'), value: 'ADMIN_CORPORATIVO' },
])

const form = reactive({
  role: 'PACIENTE',
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const validation = reactive({
  role: '',
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const hasSuccessState = computed(() => identityAccessStore.registerStatus.status === 'success')
const hasErrorState = computed(() => Object.values(validation).some(Boolean))
const canSubmit = computed(() => !identityAccessStore.loading)

function selectRole(role) {
  form.role = role
  validation.role = ''
}

function validateForm() {
  validation.role = !form.role ? t('auth.accountTypeRequired') : ''
  validation.firstName = !form.firstName.trim() ? t('auth.firstNameRequired') : ''
  validation.lastName = !form.lastName.trim() ? t('auth.lastNameRequired') : ''

  if (!form.email.trim()) validation.email = t('auth.emailRequired')
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    validation.email = t('auth.emailInvalid')
  } else validation.email = ''

  if (!form.password) validation.password = t('auth.passwordRequired')
  else if (form.password.length < 8) validation.password = t('auth.passwordMinLength')
  else validation.password = ''

  if (!form.confirmPassword) validation.confirmPassword = t('auth.confirmPasswordRequired')
  else if (form.confirmPassword !== form.password) {
    validation.confirmPassword = t('auth.passwordsDoNotMatch')
  } else validation.confirmPassword = ''

  return !Object.values(validation).some(Boolean)
}

async function submitRegister() {
  identityAccessStore.resetRegisterFeedback()
  if (!validateForm()) return
  await identityAccessStore.register(form)
}
</script>

<template>
  <AuthLayout mode="register">
    <section
      class="bt-auth-card bt-auth-card--register"
      :class="{ 'bt-auth-error': hasErrorState, 'bt-auth-success': hasSuccessState }"
    >
      <header>
        <h1 class="bt-auth-title">
          {{ hasSuccessState ? t('auth.registerSuccessTitle') : t('auth.registerTitle') }}
        </h1>
        <p class="bt-auth-subtitle">
          {{
            hasSuccessState
              ? t('auth.registerSuccessSubtitle')
              : t('auth.registerSubtitle')
          }}
        </p>
      </header>

      <Message v-if="hasErrorState && !hasSuccessState" severity="error" class="bt-auth-message">
        <strong>{{ t('auth.registerErrorTitle') }}</strong>
        <span>{{ t('auth.registerErrorDetail') }}</span>
      </Message>

      <Message v-if="hasSuccessState" severity="success" class="bt-auth-message">
        <strong>{{ t('auth.registerCompleted') }}</strong>
        <span>{{ identityAccessStore.registerStatus.message }}</span>
      </Message>

      <form class="bt-auth-form" :aria-label="t('auth.registerTitle')" @submit.prevent="submitRegister">
        <div class="bt-auth-segmented" role="group" :aria-label="t('auth.accountType')">
          <Button
            v-for="option in accountOptions"
            :key="option.value"
            type="button"
            :label="option.label"
            :class="{ 'bt-auth-segmented-active': form.role === option.value }"
            @click="selectRole(option.value)"
          />
        </div>
        <p v-if="validation.role" class="bt-auth-helper">{{ validation.role }}</p>

        <div class="bt-auth-grid">
          <div class="bt-auth-grid-field">
            <label for="register-first-name">{{ t('auth.firstName') }}</label>
            <InputText
              id="register-first-name"
              v-model="form.firstName"
              :placeholder="t('auth.firstNamePlaceholder')"
              :invalid="Boolean(validation.firstName)"
            />
            <p v-if="validation.firstName" class="bt-auth-helper">{{ validation.firstName }}</p>
          </div>

          <div class="bt-auth-grid-field">
            <label for="register-last-name">{{ t('auth.lastName') }}</label>
            <InputText
              id="register-last-name"
              v-model="form.lastName"
              :placeholder="t('auth.lastNamePlaceholder')"
              :invalid="Boolean(validation.lastName)"
            />
            <p v-if="validation.lastName" class="bt-auth-helper">{{ validation.lastName }}</p>
          </div>
        </div>

        <div class="bt-auth-field">
          <label for="register-email">{{ t('auth.email') }}</label>
          <InputText
            id="register-email"
            v-model="form.email"
            autocomplete="email"
            :placeholder="'auth.emailPlaceholder'"
            :invalid="Boolean(validation.email)"
          />
          <p v-if="validation.email" class="bt-auth-helper">{{ validation.email }}</p>
        </div>

        <div class="bt-auth-grid">
          <div class="bt-auth-grid-field bt-auth-password">
            <label for="register-password">{{ t('auth.password') }}</label>
            <Password
              input-id="register-password"
              v-model="form.password"
              toggle-mask
              :feedback="false"
              :placeholder="t('auth.passwordPlaceholder')"
              :invalid="Boolean(validation.password)"
            />
            <p v-if="validation.password" class="bt-auth-helper">{{ validation.password }}</p>
          </div>

          <div class="bt-auth-grid-field bt-auth-password">
            <label for="register-confirm-password">{{ t('auth.confirmPassword') }}</label>
            <Password
              input-id="register-confirm-password"
              v-model="form.confirmPassword"
              toggle-mask
              :feedback="false"
              :placeholder="t('auth.confirmPasswordPlaceholder')"
              :invalid="Boolean(validation.confirmPassword)"
            />
            <p v-if="validation.confirmPassword" class="bt-auth-helper">
              {{ validation.confirmPassword }}
            </p>
          </div>
        </div>

        <div class="bt-auth-actions">
       
          <RouterLink class="bt-auth-footer-link" to="/login">{{ t('auth.goToLogin') }}</RouterLink>
        </div>
      </form>
    </section>
  </AuthLayout>
</template>
