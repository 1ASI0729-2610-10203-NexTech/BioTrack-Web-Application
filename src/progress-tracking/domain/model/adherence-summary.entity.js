export class AdherenceSummary {
  constructor({
    weekLabel,
    weeklyAdherence,
    registeredDays,
    totalDays,
    mealsAccordingToPlan,
    nutritionistAlertSent,
    dayDetails,
  }) {
    this.weekLabel = weekLabel
    this.weeklyAdherence = Number(weeklyAdherence)
    this.registeredDays = Number(registeredDays)
    this.totalDays = Number(totalDays)
    this.mealsAccordingToPlan = Number(mealsAccordingToPlan)
    this.nutritionistAlertSent = Boolean(nutritionistAlertSent)
    this.dayDetails = dayDetails.map((row) => ({ ...row }))
  }
}
