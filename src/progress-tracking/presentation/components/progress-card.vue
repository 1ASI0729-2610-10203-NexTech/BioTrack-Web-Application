<script setup>
defineProps({
  title: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <section class="pt-card">
    <div v-if="title || $slots.actions" class="pt-card__head">
      <h2 v-if="title" class="pt-card__title">{{ title }}</h2>
      <div v-if="$slots.actions" class="pt-card__actions">
        <slot name="actions" />
      </div>
    </div>
    <slot />
  </section>
</template>

<style scoped>
.pt-card__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.pt-card__title {
  margin: 0;
  flex: 1 1 auto;
}

.pt-card__actions {
  flex-shrink: 0;
}
</style>
