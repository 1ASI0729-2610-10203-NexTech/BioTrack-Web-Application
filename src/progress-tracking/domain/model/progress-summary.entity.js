export class ProgressSummary {
  constructor({
    initialWeight,
    currentWeight,
    targetWeight,
    currentBMI,
    bmiStatus,
    remainingToGoal,
    weeklyAdherence,
    registeredDays,
    averageConsumedCalories,
  }) {
    this.initialWeight = initialWeight
    this.currentWeight = currentWeight
    this.targetWeight = targetWeight
    this.currentBMI = currentBMI
    this.bmiStatus = bmiStatus
    this.remainingToGoal = remainingToGoal
    this.weeklyAdherence = weeklyAdherence
    this.registeredDays = registeredDays
    this.averageConsumedCalories = averageConsumedCalories
  }
}
