<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const MEAL_ICONS = {
  breakfast: 'pi pi-sun',
  lunch: 'pi pi-th-large',
  snack: 'pi pi-shopping-bag',
  dinner: 'pi pi-moon',
}

defineProps({
  entries: {
    type: Array,
    default: () => [],
  },
})

function iconFor(mealKey) {
  return MEAL_ICONS[mealKey] || 'pi pi-circle'
}
</script>

<template>
  <ul class="pt-food-list">
    <li v-for="item in entries" :key="item.mealKey" class="pt-food-row">
      <span class="pt-food-row__icon" aria-hidden="true">
        <i :class="iconFor(item.mealKey)" />
      </span>
      <div class="pt-food-row__body">
        <p class="pt-food-row__title">{{ item.mealLabel }}</p>
        <p class="pt-food-row__desc">{{ item.detailLine }}</p>
      </div>
      <span v-if="item.completed" class="pt-food-check" :aria-label="t('progressTracking.charts.recordComplete')">✓</span>
    </li>
  </ul>
</template>

<style scoped>
.pt-food-check {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50rem;
  border: 0.125rem solid var(--pt-green, #10b981);
  color: var(--pt-green, #10b981);
  font-size: 0.875rem;
  font-weight: 700;
  flex-shrink: 0;
}
</style>
