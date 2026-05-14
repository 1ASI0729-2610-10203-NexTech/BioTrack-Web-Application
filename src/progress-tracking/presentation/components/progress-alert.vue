<script setup>
defineProps({
  message: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <div class="pt-alert" role="status">
    {{ message }}
  </div>
</template>
