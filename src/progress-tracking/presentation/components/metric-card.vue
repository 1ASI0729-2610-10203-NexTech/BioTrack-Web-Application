<script setup>
defineProps({
  label: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  hint: {
    type: String,
    default: '',
  },
  variant: {
    type: String,
    default: 'default',
  },
  valueTone: {
    type: String,
    default: 'default',
  },
  badge: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <article
    class="pt-metric-tile"
    :class="{
      'pt-metric-tile--blue': variant === 'blue',
      'pt-metric-tile--green': variant === 'green',
    }"
  >
    <p class="pt-metric-label">{{ label }}</p>
    <div class="pt-metric-row">
      <p
        class="pt-metric-value"
        :class="{
          'pt-metric-value--green': valueTone === 'green',
          'pt-metric-value--blue': valueTone === 'blue',
        }"
      >
        {{ value }}
      </p>
      <span v-if="badge" class="pt-mini-badge">{{ badge }}</span>
    </div>
    <p v-if="hint" class="pt-metric-sub">{{ hint }}</p>
    <slot />
  </article>
</template>

<style scoped>
.pt-metric-tile--green {
  background: var(--pt-green-soft, #d1fae5);
  border-color: var(--pt-green, #10b981);
}

.pt-metric-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.pt-mini-badge {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.5rem;
  border-radius: 50rem;
  background: var(--pt-green-soft, #d1fae5);
  color: var(--pt-green, #10b981);
}

.pt-metric-tile--blue .pt-metric-value {
  color: #f8fafc;
}

.pt-metric-tile--blue .pt-mini-badge {
  background: rgba(255, 255, 255, 0.2);
  color: #bbf7d0;
  border: 0.0625rem solid rgba(255, 255, 255, 0.35);
}

.pt-metric-tile--blue .pt-metric-value--green,
.pt-metric-tile--blue .pt-metric-value--blue {
  color: #f8fafc;
}
</style>
