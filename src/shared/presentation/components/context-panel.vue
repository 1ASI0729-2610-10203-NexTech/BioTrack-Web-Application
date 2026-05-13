<script setup>
defineProps({
  eyebrow: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
})
</script>

<template>
  <section class="context-panel">
    <p class="eyebrow">{{ eyebrow }}</p>
    <h1>{{ title }}</h1>
    <p class="panel-copy">{{ description }}</p>
    <div class="panel-slot">
      <slot />
    </div>
  </section>
</template>
