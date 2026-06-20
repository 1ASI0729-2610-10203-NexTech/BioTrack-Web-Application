<script setup>
import { useI18n } from 'vue-i18n'
import ContextPanel from '../../../shared/presentation/components/context-panel.vue'
import PlanRulesSummary from '../components/plan-rules-summary.vue'

const { t } = useI18n()
</script>

<template>
  <ContextPanel
    :eyebrow="t('nutritionalPlanning.eyebrow')"
    :title="t('nutritionalPlanning.title')"
    :description="t('nutritionalPlanning.description')"
  >
    <PlanRulesSummary />
    <ul class="rule-list">
      <li>{{ t('nutritionalPlanning.rule1') }}</li>
      <li>{{ t('nutritionalPlanning.rule2') }}</li>
      <li>{{ t('nutritionalPlanning.rule3') }}</li>
    </ul>
  </ContextPanel>
</template>
