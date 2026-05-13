import { BaseEntity } from '../../../shared/domain/base-entity'
import { HealthData } from './health-data.value-object'
import { NutritionalGoal } from './nutritional-goal.value-object'
import { DietaryRestriction } from './dietary-restriction.entity'

export class PatientProfile extends BaseEntity {
  constructor({
    id,
    patientId,
    firstName,
    lastName,
    healthData,
    nutritionalGoal,
    dietaryRestrictions = [],
    restrictionsConfirmed = false,
    nutritionist = null,
    createdAt,
    updatedAt,
  }) {
    super({ id, createdAt, updatedAt })
    this.patientId = patientId
    this.firstName = firstName
    this.lastName = lastName
    this.healthData = healthData
      ? healthData instanceof HealthData
        ? healthData
        : new HealthData(healthData)
      : null
    this.nutritionalGoal =
      nutritionalGoal == null
        ? null
        : nutritionalGoal instanceof NutritionalGoal
        ? nutritionalGoal
        : new NutritionalGoal(nutritionalGoal)
    this.dietaryRestrictions = dietaryRestrictions.map((restriction) =>
      restriction instanceof DietaryRestriction
        ? restriction
        : new DietaryRestriction({ label: restriction }),
    )
    this.restrictionsConfirmed = restrictionsConfirmed
    this.nutritionist = nutritionist
  }

  isComplete() {
    return Boolean(this.healthData && this.nutritionalGoal && this.restrictionsConfirmed)
  }

  markCompletedEvent() {
    return this.isComplete()
      ? {
          type: 'PerfilPacienteCompleto',
          patientId: this.patientId,
          occurredAt: new Date(),
        }
      : null
  }
}
