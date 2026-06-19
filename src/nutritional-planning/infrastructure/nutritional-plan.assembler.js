import {
  InitialEvaluation,
  NutritionalPlan,
  NutritionistAssignment,
} from '../domain/model/nutritional-plan.entity'

export const NutritionalPlanAssembler = {
  fromApi(payload) {
    return new NutritionalPlan({
      id: payload.id,
      patientId: payload.patient_id,
      evaluation: new InitialEvaluation(payload.evaluation),
      assignment: new NutritionistAssignment(payload.assignment),
      macros: payload.macros,
      days: payload.days,
      status: payload.status,
      rejectionObservation: payload.rejection_observation,
    })
  },
}
