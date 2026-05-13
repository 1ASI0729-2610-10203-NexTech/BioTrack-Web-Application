<script setup>
import Skeleton from 'primevue/skeleton'

defineOptions({ inheritAttrs: false })

defineProps({
  rows: {
    type: Number,
    default: 3,
  },
})
</script>

<template>
  <div class="flex flex-column gap-3" role="status" aria-live="polite" aria-label="Cargando">
    <Skeleton v-for="row in rows" :key="row" v-bind="$attrs" />
  </div>
</template>
