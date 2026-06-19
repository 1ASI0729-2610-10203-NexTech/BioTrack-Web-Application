import { FoodEntry } from './food-entry.entity.js'

export class ConsumptionRecord {
  constructor({ date, targetCalories, consumedCalories, dailyAdherence, meals, weekActivity }) {
    this.date = date
    this.targetCalories = Number(targetCalories)
    this.consumedCalories = Number(consumedCalories)
    this.dailyAdherence = Number(dailyAdherence)
    this.meals = meals.map((meal) => (meal instanceof FoodEntry ? meal : new FoodEntry(meal)))
    this.weekActivity = [...weekActivity]
  }
}
