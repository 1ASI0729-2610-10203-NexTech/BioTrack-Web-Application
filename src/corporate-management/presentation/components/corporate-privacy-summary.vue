<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <div class="metric-grid">
    <article class="metric-box">
      <span>{{ t('corporate.privacy.privacy') }}</span>
      <strong>{{ t('corporate.privacy.noIndividualHealth') }}</strong>
    </article>
    <article class="metric-box">
      <span>{{ t('corporate.privacy.metrics') }}</span>
      <strong>{{ t('corporate.privacy.anonymizedPublication') }}</strong>
    </article>
  </div>
</template>
