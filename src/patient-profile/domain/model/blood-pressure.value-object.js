import { DomainError } from '../../../shared/domain/domain-error'

export class BloodPressure {
  constructor({ systolic, diastolic }) {
    if (systolic < 50 || systolic > 300 || diastolic < 20 || diastolic > 200) {
      throw new DomainError('Presion arterial fuera de rango.', 'INVALID_BLOOD_PRESSURE')
    }

    this.systolic = Number(systolic)
    this.diastolic = Number(diastolic)
  }
}
