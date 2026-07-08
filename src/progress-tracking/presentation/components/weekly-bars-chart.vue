<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  labels: {
    type: Array,
    default: () => [],
  },
  activeFlags: {
    type: Array,
    default: () => [],
  },
  /** @type {'pill' | 'blocks'} */
  variant: {
    type: String,
    default: 'pill',
  },
})

const resolvedLabels = computed(() => props.labels.length ? props.labels : ['M', 'T', 'W', 'T', 'F', 'S', 'S'])
const activityLabel = (day, index) =>
  `${day} ${props.activeFlags[index] ? t('progressTracking.charts.active') : t('progressTracking.charts.inactive')}`
</script>

<template>
  <div
    class="pt-week-strip"
    :class="{ 'pt-week-strip--blocks': variant === 'blocks' }"
    role="list"
  >
    <div v-for="(day, index) in resolvedLabels" :key="`${day}-${index}`" class="pt-week-pill" role="listitem">
      <span>{{ day }}</span>
      <div
        class="pt-week-pill__bar"
        :class="{ 'pt-week-pill__bar--on': activeFlags[index] }"
        :aria-label="activityLabel(day, index)"
      />
    </div>
  </div>
</template>
