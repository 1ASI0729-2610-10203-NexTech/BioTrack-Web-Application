<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <section class="context-panel">
    <p class="microcopy">{{ t('pages.notAuthorizedEyebrow') }}</p>
    <h1>{{ t('pages.notAuthorizedTitle') }}</h1>
    <p class="panel-copy">
      {{ t('pages.notAuthorizedCopy') }}
    </p>
  </section>
</template>
