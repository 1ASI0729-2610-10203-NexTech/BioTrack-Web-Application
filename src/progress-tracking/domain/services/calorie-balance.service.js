export function calorieProgressPercent(consumed, target) {
  if (!target || target <= 0) return 0
  return Math.min(100, Math.round((consumed / target) * 100))
}

export function formatCaloriesDisplay(value) {
  return new Intl.NumberFormat('es-PE').format(Math.round(value))
}
