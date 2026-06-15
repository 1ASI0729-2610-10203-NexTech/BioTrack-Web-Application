<script setup>
defineProps({
  value: {
    type: Number,
    default: 0,
  },
  variant: {
    type: String,
    default: 'green',
  },
  onSurface: {
    type: Boolean,
    default: false,
  },
})

function clamp(n) {
  return Math.min(100, Math.max(0, n))
}
</script>

<template>
  <div
    class="pt-progress-track"
    :class="{ 'pt-progress-track--on-surface': onSurface }"
    role="progressbar"
    :aria-valuenow="clamp(value)"
    aria-valuemin="0"
    aria-valuemax="100"
  >
    <div
      class="pt-progress-fill"
      :class="{ 'pt-progress-fill--blue': variant === 'blue' }"
      :style="{ width: clamp(value) + '%' }"
    />
  </div>
</template>
