export class IndividualSubscription {
  constructor({ planId, planName, status, activatedAt, renewsAt }) {
    this.planId = planId
    this.planName = planName
    this.status = status
    this.activatedAt = activatedAt
    this.renewsAt = renewsAt
  }
}
