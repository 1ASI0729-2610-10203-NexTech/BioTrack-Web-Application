<script setup>
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from '../language-switcher/LanguageSwitcher.vue'

defineProps({
  mode: {
    type: String,
    default: 'login',
    validator: (value) => ['login', 'register'].includes(value),
  },
})

const { t } = useI18n()
</script>

<template>
  <header class="bt-auth-header" role="banner">
    <RouterLink class="bt-auth-brand" to="/login" aria-label="BioTrack">
      <img src="../../../../assets/logo.png" alt="BioTrack" class="bt-auth-brand-logo" />
    </RouterLink>

    <div class="bt-auth-header-actions">
      <LanguageSwitcher />
      <p class="bt-auth-switch">
        <template v-if="mode === 'register'">
          {{ t('auth.alreadyHaveAccount') }}
          <RouterLink to="/login">{{ t('auth.signIn') }}</RouterLink>
        </template>
        <template v-else>
          {{ t('auth.noAccount') }}
          <RouterLink to="/register">{{ t('auth.createAccount') }}</RouterLink>
        </template>
      </p>
    </div>
  </header>
</template>
