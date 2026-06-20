import { DomainError } from '../../../shared/domain/domain-error'
import { BloodPressure } from './blood-pressure.value-object'
import { calculateBMI } from './bmi.value-object'
import { ActivityLevel } from './activity-level.value-object'
import { BiologicalSex } from './biological-sex.value-object'

export class HealthData {
  constructor({
    weightKg,
    heightCm,
    age,
    biologicalSex,
    activityLevel,
    systolic,
    diastolic,
    glucoseMgDl,
  }) {
    if (weightKg < 10 || weightKg > 300) throw new DomainError('Peso fuera de rango.', 'INVALID_WEIGHT')
    if (heightCm < 50 || heightCm > 250) throw new DomainError('Talla fuera de rango.', 'INVALID_HEIGHT')
    if (age != null && (age < 1 || age > 120)) throw new DomainError('Edad fuera de rango.', 'INVALID_AGE')
    if (glucoseMgDl != null && (glucoseMgDl < 50 || glucoseMgDl > 300)) {
      throw new DomainError('Glucosa fuera de rango.', 'INVALID_GLUCOSE')
    }

    this.weightKg = Number(weightKg)
    this.heightCm = Number(heightCm)
    this.age = age != null ? Number(age) : null
    this.biologicalSex = biologicalSex
      ? biologicalSex instanceof BiologicalSex
        ? biologicalSex
        : new BiologicalSex(biologicalSex)
      : null
    this.activityLevel =
      activityLevel instanceof ActivityLevel ? activityLevel : new ActivityLevel(activityLevel)
    this.bloodPressure =
      systolic != null && diastolic != null ? new BloodPressure({ systolic, diastolic }) : null
    this.glucoseMgDl = glucoseMgDl != null ? Number(glucoseMgDl) : null
    this.bmi = calculateBMI(this.weightKg, this.heightCm)
  }
}
