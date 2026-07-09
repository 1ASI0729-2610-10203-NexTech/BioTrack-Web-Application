import { apiService } from '../../shared/infrastructure/api.service'
import { NutritionalPlanAssembler } from './nutritional-plan.assembler'

export const nutritionalPlanningApiService = {
  async fetchPlans() {
    const plans = await apiService.get('/nutritional-plans')
    return (Array.isArray(plans) ? plans : []).map(NutritionalPlanAssembler.fromApi)
  },

  async createPlan(_nutritionistUserId, patientId, payload) {
    const created = await apiService.post('/nutritional-plans', {
      name: payload.name,
      calorieTarget: payload.dailyCalories ?? payload.calorieTarget,
      proteinGrams: payload.proteinGrams,
      carbsGrams: payload.carbsGrams,
      fatGrams: payload.fatGrams,
      patientId: patientId ?? null,
    })
    return { plan: NutritionalPlanAssembler.fromApi(created) }
  },

  async fetchWeeklyDiet(planId) {
    return apiService.get(`/nutritional-plans/${planId}/weekly-diet`)
  },

  async fetchAssignedPatients(_nutritionistUserId) {
    return { nutritionist: {}, patients: [] }
  },

  async fetchAssignedPatientDetail(_nutritionistUserId, _patientId) {
    return { nutritionist: {}, patient: null }
  },

  async createEvaluation(_nutritionistUserId, _patientId, _payload) {
    return {}
  },

  async updatePlanStatus(_nutritionistUserId, _patientId, _planId, _status) {
    return {}
  },

  async saveFollowUpNote(_nutritionistUserId, _patientId, _note) {
    return {}
  },
}
