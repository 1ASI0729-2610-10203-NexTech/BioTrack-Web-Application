import { DietDay } from './diet-day.entity'

export class WeeklyDiet {
  constructor({ days = [] }) {
    this.days = days.map((day) => (day instanceof DietDay ? day : new DietDay(day)))
  }
}
