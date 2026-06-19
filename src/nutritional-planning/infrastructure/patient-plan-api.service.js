import { apiService } from '../../shared/infrastructure/api.service'

function mapPlan(payload) {
  return {
    id: payload.id,
    name: payload.name,
    calorieTarget: payload.calorieTarget,
    proteinGrams: payload.proteinGrams,
    carbsGrams: payload.carbsGrams,
    fatGrams: payload.fatGrams,
    status: payload.status,
    nutritionistId: payload.nutritionistId,
    createdAt: payload.createdAt,
    updatedAt: payload.updatedAt,
  }
}

export const patientPlanApiService = {
  async fetchPlans() {
    const plans = await apiService.get('/nutritional-plans')
    return (Array.isArray(plans) ? plans : []).map(mapPlan)
  },

  async fetchWeeklyDiet(planId) {
    return apiService.get(`/nutritional-plans/${planId}/weekly-diet`)
  },
}
