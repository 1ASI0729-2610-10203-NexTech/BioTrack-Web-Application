<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { projectWeightsToPoints } from '../../domain/services/weight-progress.service.js'

const { t } = useI18n()

const props = defineProps({
  weights: {
    type: Array,
    default: () => [],
  },
  yMin: {
    type: Number,
    default: null,
  },
  yMax: {
    type: Number,
    default: null,
  },
  axisTickLabels: {
    type: Array,
    default: null,
  },
})

const layout = computed(() =>
  projectWeightsToPoints(
    props.weights,
    { width: 400, height: 200, padding: 28 },
    props.yMin != null && props.yMax != null ? { yMin: props.yMin, yMax: props.yMax } : {},
  ),
)

const pathD = computed(() => {
  const pts = layout.value.points
  if (!pts.length) return ''
  return pts
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(' ')
})

const axisTicks = computed(() => {
  if (props.axisTickLabels?.length) return props.axisTickLabels
  const { min, max } = layout.value
  return [max, (max + min) / 2, min].map((value) => `${Math.round(value)} kg`)
})
</script>

<template>
  <svg
    class="pt-line-chart"
    viewBox="0 0 400 200"
    preserveAspectRatio="xMidYMid meet"
    role="img"
    :aria-label="t('progressTracking.charts.weightEvolutionAria')"
  >
    <g class="pt-line-chart__grid">
      <line x1="28" y1="40" x2="372" y2="40" />
      <line x1="28" y1="100" x2="372" y2="100" />
      <line x1="28" y1="160" x2="372" y2="160" />
    </g>
    <g class="pt-line-chart__axis">
      <text x="4" y="44">{{ axisTicks[0] }}</text>
      <text x="4" y="104">{{ axisTicks[1] }}</text>
      <text x="4" y="164">{{ axisTicks[2] }}</text>
    </g>
    <path :d="pathD" />
    <circle
      v-for="(point, index) in layout.points"
      :key="index"
      :cx="point.x"
      :cy="point.y"
      r="4"
    />
  </svg>
</template>
