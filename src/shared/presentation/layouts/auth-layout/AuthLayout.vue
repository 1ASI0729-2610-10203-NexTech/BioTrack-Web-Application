<script setup>
import AuthHeader from '../../components/auth-header/AuthHeader.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps({
  mode: {
    type: String,
    default: 'login',
    validator: (value) => ['login', 'register'].includes(value),
  },
})
</script>

<template>
  <div class="bt-auth-shell">
    <a class="bt-skip-link" href="#auth-main">{{ t('app.skipToContent') }}</a>
    <AuthHeader :mode="mode" />
    <main id="auth-main" class="bt-auth-main" tabindex="-1" :aria-label="t('app.mainContent')">
      <slot />
    </main>
  </div>
</template>
