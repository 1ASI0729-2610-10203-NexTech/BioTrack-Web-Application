import { DomainError } from '../../../shared/domain/domain-error'

export class BMI {
  constructor(value) {
    if (!Number.isFinite(value) || value < 10 || value > 80) {
      throw new DomainError('IMC fuera de rango.', 'INVALID_BMI')
    }

    this.value = Number(value.toFixed(2))
  }
}

export function calculateBMI(weightKg, heightCm) {
  const heightM = Number(heightCm) / 100
  return new BMI(Number(weightKg) / (heightM * heightM))
}
