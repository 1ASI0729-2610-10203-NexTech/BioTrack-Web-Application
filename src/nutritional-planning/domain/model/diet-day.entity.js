import { DietMeal } from './diet-meal.entity'

export class DietDay {
  constructor({ name, meals = [] }) {
    this.name = name
    this.meals = meals.map((meal) => (meal instanceof DietMeal ? meal : new DietMeal(meal)))
  }
}
