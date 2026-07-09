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
    const data = await apiService.get('/nutritional-plans/my-patients')
    return {
      nutritionist: data.nutritionist ?? {},
      patients: Array.isArray(data.patients) ? data.patients : [],
    }
  },

  async fetchAssignedPatientDetail(_nutritionistUserId, patientId) {
    const data = await apiService.get(`/nutritional-plans/patients/${patientId}`)
    return {
      nutritionist: data.nutritionist ?? {},
      patient: data.patient ?? null,
    }
  },

  async createEvaluation(_nutritionistUserId, patientId, payload) {
    return apiService.post(`/nutritional-plans/patients/${patientId}/evaluations`, {
      observations: payload.observations,
      targetCalories: payload.targetCalories,
      proteinPercentage: payload.proteinPercentage,
      carbohydratePercentage: payload.carbohydratePercentage,
      fatPercentage: payload.fatPercentage,
    })
  },

  async updatePlanStatus(_nutritionistUserId, _patientId, planId, status) {
    return apiService.patch(`/nutritional-plans/${planId}/status`, { status })
  },

  async saveFollowUpNote(_nutritionistUserId, patientId, note) {
    return apiService.post(`/nutritional-plans/patients/${patientId}/notes`, { note })
  },
}
