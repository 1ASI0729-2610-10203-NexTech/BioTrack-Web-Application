export class FoodEntry {
  constructor({ mealKey, mealLabel, description, calories, completed }) {
    this.mealKey = mealKey
    this.mealLabel = mealLabel
    this.description = description
    this.calories = Number(calories)
    this.completed = Boolean(completed)
  }

  get detailLine() {
    return `${this.description} · ${this.calories} kcal`
  }
}
