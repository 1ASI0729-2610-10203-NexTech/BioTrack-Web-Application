<script setup>
import { computed } from 'vue'
import Button from 'primevue/button'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'outline', 'text', 'secondary'].includes(value),
  },
  label: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    default: '',
  },
  ariaLabel: {
    type: String,
    default: '',
  },
})

const buttonProps = computed(() => ({
  outlined: props.variant === 'outline',
  text: props.variant === 'text',
  severity: props.variant === 'secondary' ? 'secondary' : undefined,
}))
</script>

<template>
  <Button
    v-bind="{ ...buttonProps, ...$attrs }"
    :label="label || undefined"
    :icon="icon || undefined"
    :aria-label="ariaLabel || label || undefined"
  >
    <slot />
  </Button>
</template>
