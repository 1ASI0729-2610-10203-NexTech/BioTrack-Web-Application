export class WeightRecord {
  constructor({ weightKg, date, comment = '' }) {
    this.weightKg = Number(weightKg)
    this.date = date
    this.comment = comment
  }
}
