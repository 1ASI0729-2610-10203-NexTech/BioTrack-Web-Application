import { DomainError } from '../../../shared/domain/domain-error'
import { t } from '../../../locales'

export class BMI {
  constructor(value) {
    this.value = Number(value.toFixed(2))
  }
}

export function calculateBMI(weightKg, heightCm) {
  const w = Number(weightKg)
  const hM = Number(heightCm) / 100
  if (!hM || hM <= 0 || !w || w <= 0) return null
  const bmi = w / (hM * hM)
  if (!Number.isFinite(bmi) || bmi < 5 || bmi > 100) return null
  return new BMI(bmi)
}

export function getBMIStatus(bmiValue) {
  const value = Number(bmiValue)
  if (!Number.isFinite(value) || value <= 0) return t('stores.bmi.pending')
  if (value < 18.5) return t('stores.bmi.underweight')
  if (value < 25) return t('stores.bmi.normal')
  if (value < 30) return t('stores.bmi.overweight')
  return t('stores.bmi.obesity')
}
