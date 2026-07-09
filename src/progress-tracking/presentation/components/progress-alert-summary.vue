<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <div class="metric-grid">
    <article class="metric-box">
      <span>{{ t('progressTracking.alertSummary.adherence') }}</span>
      <strong>{{ t('progressTracking.alertSummary.registeredDaysGoal') }}</strong>
    </article>
    <article class="metric-box">
      <span>{{ t('progressTracking.alertSummary.alert') }}</span>
      <strong>{{ t('progressTracking.alertSummary.threshold') }}</strong>
    </article>
  </div>
</template>
