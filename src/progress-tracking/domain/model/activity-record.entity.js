export class ActivityRecord {
  constructor({ type, durationMinutes, intensity, burnedCalories, date }) {
    this.type = type
    this.durationMinutes = Number(durationMinutes)
    this.intensity = intensity
    this.burnedCalories = Number(burnedCalories)
    this.date = date
  }
}
