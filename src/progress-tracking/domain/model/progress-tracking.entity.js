import { BaseEntity } from '../../../shared/domain/base-entity'
import { DomainError } from '../../../shared/domain/domain-error'

export class AdherencePercentage {
  constructor(value) {
    if (value < 0 || value > 100) {
      throw new DomainError('Porcentaje de adherencia invalido.', 'INVALID_ADHERENCE')
    }
    this.value = Number(value.toFixed(2))
  }
}

export class ReportPeriod {
  constructor({ startDate, endDate }) {
    this.startDate = new Date(startDate)
    this.endDate = new Date(endDate)
    if (this.startDate > this.endDate) {
      throw new DomainError('Periodo de reporte invalido.', 'INVALID_REPORT_PERIOD')
    }
  }

  key() {
    return `${this.startDate.toISOString()}_${this.endDate.toISOString()}`
  }
}

export class ActivityIntensity {
  constructor(value) {
    if (!['low', 'moderate', 'high'].includes(value)) {
      throw new DomainError('Intensidad invalida.', 'INVALID_ACTIVITY_INTENSITY')
    }
    this.value = value
  }
}

export class FoodConsumptionRecord extends BaseEntity {
  constructor({ id, patientId, date, mealType, summary }) {
    super({ id })
    this.patientId = patientId
    this.date = date
    this.mealType = mealType
    this.summary = summary
  }

  uniqueKey() {
    return `${this.patientId}_${this.date}_${this.mealType}`
  }
}

export class ActivityRecord extends BaseEntity {
  constructor({ id, patientId, minutes, intensity }) {
    super({ id })
    this.patientId = patientId
    this.minutes = minutes
    this.intensity =
      intensity instanceof ActivityIntensity ? intensity : new ActivityIntensity(intensity)
  }
}

export class WeightRecord extends BaseEntity {}

export function calculateAdherence(recordedDays, targetDays) {
  return new AdherencePercentage((recordedDays / Math.max(targetDays, 1)) * 100)
}

export class PlanAdherence extends BaseEntity {
  constructor({ id, patientId, recordedDays, targetDays }) {
    super({ id })
    this.patientId = patientId
    this.recordedDays = recordedDays
    this.targetDays = targetDays
    this.percentage = calculateAdherence(recordedDays, targetDays)
  }
}

export class AdherenceAlert extends BaseEntity {
  constructor({ id, patientId, reportPeriod }) {
    super({ id })
    this.patientId = patientId
    this.reportPeriod =
      reportPeriod instanceof ReportPeriod ? reportPeriod : new ReportPeriod(reportPeriod)
  }

  static createOnce({ patientId, reportPeriod, existingAlerts = [] }) {
    const period = reportPeriod instanceof ReportPeriod ? reportPeriod : new ReportPeriod(reportPeriod)
    const alreadyExists = existingAlerts.some((alert) => alert.reportPeriod.key() === period.key())
    return alreadyExists ? null : new AdherenceAlert({ patientId, reportPeriod: period })
  }
}

export class EvolutionReport extends BaseEntity {
  constructor({ id, patientId, dataPoints = [] }) {
    super({ id })
    this.patientId = patientId
    this.dataPoints = dataPoints
  }

  canGeneratePdf() {
    return this.dataPoints.length >= 3
  }
}
