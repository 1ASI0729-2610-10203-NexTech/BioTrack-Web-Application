<script setup>
import Dialog from 'primevue/dialog'

defineOptions({ inheritAttrs: false })

defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['update:visible'])
</script>

<template>
  <Dialog
    v-bind="$attrs"
    :visible="visible"
    modal
    @update:visible="$emit('update:visible', $event)"
  >
    <slot />
    <template v-if="$slots.footer" #footer>
      <slot name="footer" />
    </template>
  </Dialog>
</template>
