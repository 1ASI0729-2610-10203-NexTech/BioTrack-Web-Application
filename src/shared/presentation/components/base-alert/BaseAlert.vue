<script setup>
import Message from 'primevue/message'

defineOptions({ inheritAttrs: false })

defineProps({
  severity: {
    type: String,
    default: 'info',
    validator: (value) => ['success', 'info', 'warn', 'error'].includes(value),
  },
})
</script>

<template>
  <Message v-bind="$attrs" :severity="severity">
    <slot />
  </Message>
</template>
