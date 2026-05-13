export class ProgressSummary {
  constructor({
    initialWeight,
    currentWeight,
    targetWeight,
    weeklyAdherence,
    registeredDays,
    weeklyActivityMinutes,
    weeklyBurnedCalories,
    averageConsumedCalories,
  }) {
    this.initialWeight = initialWeight
    this.currentWeight = currentWeight
    this.targetWeight = targetWeight
    this.weeklyAdherence = weeklyAdherence
    this.registeredDays = registeredDays
    this.weeklyActivityMinutes = weeklyActivityMinutes
    this.weeklyBurnedCalories = weeklyBurnedCalories
    this.averageConsumedCalories = averageConsumedCalories
  }
}
