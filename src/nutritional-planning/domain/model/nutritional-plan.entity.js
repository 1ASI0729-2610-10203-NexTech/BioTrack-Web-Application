import { BaseEntity } from '../../../shared/domain/base-entity'
import { DomainError } from '../../../shared/domain/domain-error'

export class MacronutrientDistribution {
  constructor({ proteins, carbohydrates, fats }) {
    const total = proteins + carbohydrates + fats
    if (total !== 100) {
      throw new DomainError('Los macronutrientes deben sumar 100%.', 'INVALID_MACROS')
    }
    this.proteins = proteins
    this.carbohydrates = carbohydrates
    this.fats = fats
  }
}

export class PlanStatus {
  constructor(value = 'proposed') {
    if (!['proposed', 'active', 'rejected', 'finished', 'suspended'].includes(value)) {
      throw new DomainError('Estado de plan invalido.', 'INVALID_PLAN_STATUS')
    }
    this.value = value
  }
}

export class AppointmentStatus {
  constructor(value = 'scheduled') {
    if (!['scheduled', 'completed', 'cancelled'].includes(value)) {
      throw new DomainError('Estado de cita invalido.', 'INVALID_APPOINTMENT_STATUS')
    }
    this.value = value
  }
}

export class MealType {
  constructor(value) {
    if (!['breakfast', 'lunch', 'dinner', 'snack'].includes(value)) {
      throw new DomainError('Tipo de comida invalido.', 'INVALID_MEAL_TYPE')
    }
    this.value = value
  }
}

export class NutritionistProfile extends BaseEntity {}

export class NutritionistAssignment extends BaseEntity {
  constructor({ id, nutritionistId, patientId, assignedAt = new Date() }) {
    super({ id })
    this.nutritionistId = nutritionistId
    this.patientId = patientId
    this.assignedAt = new Date(assignedAt)
  }
}

export class InitialEvaluation extends BaseEntity {
  constructor({ id, patientId, completed = false }) {
    super({ id })
    this.patientId = patientId
    this.completed = completed
  }
}

export class PlanMeal {
  constructor({ mealType, summary }) {
    this.mealType = mealType instanceof MealType ? mealType : new MealType(mealType)
    this.summary = summary
  }
}

export class PlanDay {
  constructor({ weekday, meals = [] }) {
    this.weekday = weekday
    this.meals = meals.map((meal) => (meal instanceof PlanMeal ? meal : new PlanMeal(meal)))
  }
}

export class NutritionalPlan extends BaseEntity {
  constructor({
    id,
    patientId,
    evaluation,
    assignment,
    macros,
    days = [],
    status,
    rejectionObservation = '',
  }) {
    super({ id })
    if (!evaluation?.completed) {
      throw new DomainError('La evaluacion inicial debe estar completada.', 'EVALUATION_REQUIRED')
    }

    this.patientId = patientId
    this.evaluation = evaluation
    this.assignment = assignment
    this.macros =
      macros instanceof MacronutrientDistribution ? macros : new MacronutrientDistribution(macros)
    this.days = days.map((day) => (day instanceof PlanDay ? day : new PlanDay(day)))
    this.status = status instanceof PlanStatus ? status : new PlanStatus(status)
    this.rejectionObservation = rejectionObservation

    if (this.status.value === 'rejected' && !this.rejectionObservation.trim()) {
      throw new DomainError('Un plan rechazado requiere observacion.', 'REJECTION_OBSERVATION_REQUIRED')
    }
  }
}

export class ControlConsultation extends BaseEntity {
  constructor({ id, appointmentStatus }) {
    super({ id })
    this.appointmentStatus =
      appointmentStatus instanceof AppointmentStatus
        ? appointmentStatus
        : new AppointmentStatus(appointmentStatus)
  }
}
