<script setup>
import { computed, useId } from 'vue'
import InputText from 'primevue/inputtext'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  message: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'error', 'success'].includes(value),
  },
})

const emit = defineEmits(['update:modelValue'])
const inputId = useId()

const wrapperClass = computed(() => [
  'flex flex-column gap-2',
  props.status === 'success' ? 'bt-input-success' : '',
])

function handleUpdate(value) {
  emit('update:modelValue', value)
}
</script>

<template>
  <div :class="wrapperClass">
    <label v-if="label" :for="inputId">{{ label }}</label>
    <InputText
      v-bind="$attrs"
      :id="inputId"
      :model-value="modelValue"
      :invalid="status === 'error'"
      :aria-invalid="status === 'error'"
      :aria-describedby="message ? `${inputId}-message` : undefined"
      @update:model-value="handleUpdate"
    />
    <small v-if="message" :id="`${inputId}-message`" class="text-muted">
      {{ message }}
    </small>
  </div>
</template>
