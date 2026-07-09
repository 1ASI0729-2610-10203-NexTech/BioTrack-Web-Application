import { apiService } from '../../shared/infrastructure/api.service'
import { NutritionalPlanAssembler } from './nutritional-plan.assembler'

const UNSUPPORTED_WORKFLOW =
  'El backend actual todavía no publica asignaciones, evaluaciones ni notas de seguimiento.'

function unsupportedWorkflow() {
  throw new Error(UNSUPPORTED_WORKFLOW)
}

export const nutritionalPlanningApiService = {
  async fetchPlans() {
    const plans = await apiService.get('/nutritional-plans')
    return (Array.isArray(plans) ? plans : []).map(NutritionalPlanAssembler.fromApi)
  },

  async createPlan(_nutritionistUserId, _patientId, payload) {
    const created = await apiService.post('/nutritional-plans', {
      name: payload.name,
      calorieTarget: Number(payload.dailyCalories ?? payload.calorieTarget),
      proteinGrams: Number(payload.proteinGrams ?? payload.proteinPercentage),
      carbsGrams: Number(payload.carbsGrams ?? payload.carbohydratePercentage),
      fatGrams: Number(payload.fatGrams ?? payload.fatPercentage),
    })
    return { plan: NutritionalPlanAssembler.fromApi(created) }
  },

  async fetchWeeklyDiet(planId) {
    return apiService.get(`/nutritional-plans/${planId}/weekly-diet`)
  },

  async fetchAssignedPatients() {
    return unsupportedWorkflow()
  },

  async fetchAssignedPatientDetail() {
    return unsupportedWorkflow()
  },

  async createEvaluation() {
    return unsupportedWorkflow()
  },

  async updatePlanStatus() {
    return unsupportedWorkflow()
  },

  async saveFollowUpNote() {
    return unsupportedWorkflow()
  },
}
