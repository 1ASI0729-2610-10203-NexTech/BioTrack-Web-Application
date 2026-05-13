import { DomainError } from '../../../shared/domain/domain-error'

export class BloodPressure {
  constructor({ systolic, diastolic }) {
    if (systolic < 70 || systolic > 250 || diastolic < 40 || diastolic > 150) {
      throw new DomainError('Presion arterial fuera de rango.', 'INVALID_BLOOD_PRESSURE')
    }

    this.systolic = systolic
    this.diastolic = diastolic
  }
}
