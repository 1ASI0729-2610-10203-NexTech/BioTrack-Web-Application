import { PatientPlanStatus } from './plan-status.value-object'

export class PatientPlan {
  constructor({
    title,
    nutritionist,
    date,
    dailyCalories,
    goal,
    macros,
    status = PatientPlanStatus.NONE,
  }) {
    this.title = title
    this.nutritionist = nutritionist
    this.date = date
    this.dailyCalories = Number(dailyCalories ?? 0)
    this.goal = goal
    this.macros = macros
    this.status = status
  }

  activate() {
    this.status = PatientPlanStatus.ACTIVE
  }

  reject() {
    this.status = PatientPlanStatus.REJECTED
  }

  isActive() {
    return this.status === PatientPlanStatus.ACTIVE
  }
}
