<script setup>
import { computed, reactive } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Password from 'primevue/password'
import AuthLayout from '../../../shared/presentation/layouts/auth-layout/AuthLayout.vue'
import { useIdentityAccessStore } from '../../application/identity-access.store'

const identityAccessStore = useIdentityAccessStore()

const accountOptions = [
  { label: 'Paciente', value: 'PACIENTE' },
  { label: 'Nutricionista', value: 'NUTRICIONISTA' },
  { label: 'Corporativo', value: 'ADMIN_CORPORATIVO' },
]

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
  validation.role = !form.role ? 'Debes seleccionar un tipo de cuenta.' : ''
  validation.firstName = !form.firstName.trim() ? 'El nombre es obligatorio.' : ''
  validation.lastName = !form.lastName.trim() ? 'El apellido es obligatorio.' : ''

  if (!form.email.trim()) validation.email = 'El correo electronico es obligatorio.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    validation.email = 'Ingresa un correo electronico valido.'
  } else validation.email = ''

  if (!form.password) validation.password = 'La contrasena es obligatoria.'
  else if (form.password.length < 8) validation.password = 'Minimo 8 caracteres.'
  else validation.password = ''

  if (!form.confirmPassword) validation.confirmPassword = 'Debe confirmar la contrasena.'
  else if (form.confirmPassword !== form.password) {
    validation.confirmPassword = 'Las contrasenas no coinciden.'
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
          {{ hasSuccessState ? '¡Cuenta creada con exito!' : 'Crear cuenta' }}
        </h1>
        <p class="bt-auth-subtitle">
          {{
            hasSuccessState
              ? 'Tu registro fue procesado correctamente.'
              : 'Completa todos los campos obligatorios para continuar.'
          }}
        </p>
      </header>

      <Message v-if="hasErrorState && !hasSuccessState" severity="error" class="bt-auth-message">
        <strong>No se pudo registrar tu cuenta</strong>
        <span>Revisa los campos marcados antes de continuar.</span>
      </Message>

      <Message v-if="hasSuccessState" severity="success" class="bt-auth-message">
        <strong>Registro completado</strong>
        <span>{{ identityAccessStore.registerStatus.message }}</span>
      </Message>

      <form class="bt-auth-form" @submit.prevent="submitRegister">
        <div class="bt-auth-segmented" role="group" aria-label="Tipo de cuenta">
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
            <label for="register-first-name">Nombre</label>
            <InputText
              id="register-first-name"
              v-model="form.firstName"
              placeholder="Juan"
              :invalid="Boolean(validation.firstName)"
            />
            <p v-if="validation.firstName" class="bt-auth-helper">{{ validation.firstName }}</p>
          </div>

          <div class="bt-auth-grid-field">
            <label for="register-last-name">Apellido</label>
            <InputText
              id="register-last-name"
              v-model="form.lastName"
              placeholder="Perez"
              :invalid="Boolean(validation.lastName)"
            />
            <p v-if="validation.lastName" class="bt-auth-helper">{{ validation.lastName }}</p>
          </div>
        </div>

        <div class="bt-auth-field">
          <label for="register-email">Correo electronico</label>
          <InputText
            id="register-email"
            v-model="form.email"
            autocomplete="email"
            placeholder="juan.perez@gmail.com"
            :invalid="Boolean(validation.email)"
          />
          <p v-if="validation.email" class="bt-auth-helper">{{ validation.email }}</p>
        </div>

        <div class="bt-auth-grid">
          <div class="bt-auth-grid-field bt-auth-password">
            <label for="register-password">Contrasena</label>
            <Password
              input-id="register-password"
              v-model="form.password"
              toggle-mask
              :feedback="false"
              placeholder="Minimo 8 caracteres"
              :invalid="Boolean(validation.password)"
            />
            <p v-if="validation.password" class="bt-auth-helper">{{ validation.password }}</p>
          </div>

          <div class="bt-auth-grid-field bt-auth-password">
            <label for="register-confirm-password">Confirmar contrasena</label>
            <Password
              input-id="register-confirm-password"
              v-model="form.confirmPassword"
              toggle-mask
              :feedback="false"
              placeholder="Repite la contrasena"
              :invalid="Boolean(validation.confirmPassword)"
            />
            <p v-if="validation.confirmPassword" class="bt-auth-helper">
              {{ validation.confirmPassword }}
            </p>
          </div>
        </div>

        <div class="bt-auth-actions">
          <Button
            v-if="hasSuccessState"
            class="bt-auth-button"
            icon="pi pi-envelope"
            label="Ir a verificar correo electronico"
            type="button"
          />
          <Button
            v-else
            class="bt-auth-button"
            label="Completa los campos requeridos para crear la cuenta"
            :disabled="identityAccessStore.loading"
            :loading="identityAccessStore.loading"
            type="submit"
          />
          <RouterLink class="bt-auth-footer-link" to="/login">Ir al inicio de sesion</RouterLink>
        </div>
      </form>
    </section>
  </AuthLayout>
</template>
