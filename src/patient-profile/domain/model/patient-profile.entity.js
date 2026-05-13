import { BaseEntity } from '../../../shared/domain/base-entity'
import { DomainError } from '../../../shared/domain/domain-error'
import { BloodPressure } from './blood-pressure.value-object'
import { calculateBMI } from './bmi.value-object'
import { ActivityLevel, BiologicalSex } from './profile-enums.value-object'

export class DietaryRestriction {
  constructor({ label }) {
    this.label = label
  }
}

export class NutritionalGoal {
  constructor({ description, targetWeightKg }) {
    this.description = description
    this.targetWeightKg = targetWeightKg
  }
}

export class HealthData {
  constructor({ weightKg, heightCm, age, glucoseMgDl, bloodPressure }) {
    if (weightKg < 20 || weightKg > 350) throw new DomainError('Peso fuera de rango.', 'INVALID_WEIGHT')
    if (heightCm < 80 || heightCm > 250) throw new DomainError('Talla fuera de rango.', 'INVALID_HEIGHT')
    if (age < 0 || age > 120) throw new DomainError('Edad fuera de rango.', 'INVALID_AGE')
    if (glucoseMgDl < 40 || glucoseMgDl > 500) {
      throw new DomainError('Glucosa fuera de rango.', 'INVALID_GLUCOSE')
    }

    this.weightKg = weightKg
    this.heightCm = heightCm
    this.age = age
    this.glucoseMgDl = glucoseMgDl
    this.bloodPressure =
      bloodPressure instanceof BloodPressure ? bloodPressure : new BloodPressure(bloodPressure)
    this.bmi = calculateBMI(weightKg, heightCm)
  }
}

export class PatientProfile extends BaseEntity {
  constructor({
    id,
    patientId,
    healthData,
    dietaryRestrictions = [],
    nutritionalGoal,
    activityLevel,
    biologicalSex,
    createdAt,
    updatedAt,
  }) {
    super({ id, createdAt, updatedAt })
    this.patientId = patientId
    this.healthData = healthData instanceof HealthData ? healthData : new HealthData(healthData)
    this.dietaryRestrictions = dietaryRestrictions.map((item) =>
      item instanceof DietaryRestriction ? item : new DietaryRestriction(item),
    )
    this.nutritionalGoal =
      nutritionalGoal instanceof NutritionalGoal ? nutritionalGoal : new NutritionalGoal(nutritionalGoal)
    this.activityLevel =
      activityLevel instanceof ActivityLevel ? activityLevel : new ActivityLevel(activityLevel)
    this.biologicalSex =
      biologicalSex instanceof BiologicalSex ? biologicalSex : new BiologicalSex(biologicalSex)
  }

  isComplete() {
    return Boolean(this.patientId && this.healthData && this.nutritionalGoal)
  }

  markCompletedEvent() {
    return this.isComplete()
      ? { type: 'PatientProfileCompleted', patientId: this.patientId, occurredAt: new Date() }
      : null
  }
}
