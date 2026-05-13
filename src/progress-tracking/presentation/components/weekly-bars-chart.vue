<script setup>
defineProps({
  labels: {
    type: Array,
    default: () => ['L', 'M', 'X', 'J', 'V', 'S', 'D'],
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
</script>

<template>
  <div
    class="pt-week-strip"
    :class="{ 'pt-week-strip--blocks': variant === 'blocks' }"
    role="list"
  >
    <div v-for="(day, index) in labels" :key="day" class="pt-week-pill" role="listitem">
      <span>{{ day }}</span>
      <div
        class="pt-week-pill__bar"
        :class="{ 'pt-week-pill__bar--on': activeFlags[index] }"
        :aria-label="`${day} ${activeFlags[index] ? 'activo' : 'sin actividad'}`"
      />
    </div>
  </div>
</template>
