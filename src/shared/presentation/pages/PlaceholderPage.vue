<script setup>
defineProps({
  eyebrow: {
    type: String,
    default: 'BioTrack',
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: 'Vista placeholder preparada para futura implementacion.',
  },
})
</script>

<template>
  <section class="context-panel">
    <p class="microcopy">{{ eyebrow }}</p>
    <h1>{{ title }}</h1>
    <p class="panel-copy">{{ description }}</p>
  </section>
</template>
