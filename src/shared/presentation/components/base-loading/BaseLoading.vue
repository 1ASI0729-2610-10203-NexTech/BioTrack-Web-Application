<script setup>
import { useI18n } from 'vue-i18n'
import Skeleton from 'primevue/skeleton'

defineOptions({ inheritAttrs: false })

const { t } = useI18n()

defineProps({
  rows: {
    type: Number,
    default: 3,
  },
})
</script>

<template>
  <div class="flex flex-column gap-3" role="status" aria-live="polite" :aria-label="t('common.loadingAria')">
    <Skeleton v-for="row in rows" :key="row" v-bind="$attrs" />
  </div>
</template>
