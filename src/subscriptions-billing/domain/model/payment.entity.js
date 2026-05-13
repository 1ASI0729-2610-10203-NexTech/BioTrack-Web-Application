export class Payment {
  constructor({ planName, amount, paidAt, cardLastFourDigits }) {
    this.planName = planName
    this.amount = amount
    this.paidAt = paidAt
    this.cardLastFourDigits = cardLastFourDigits
  }
}
