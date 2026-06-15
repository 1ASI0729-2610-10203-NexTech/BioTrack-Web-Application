export class WeightRecord {
  constructor({ id, patientId, weightKg, date, type = 'PROGRESS', source = 'WEEKLY_UPDATE', comment = '' }) {
    this.id = id
    this.patientId = patientId
    this.weightKg = Number(weightKg)
    this.date = date
    this.type = type
    this.source = source
    this.comment = comment
  }
}
