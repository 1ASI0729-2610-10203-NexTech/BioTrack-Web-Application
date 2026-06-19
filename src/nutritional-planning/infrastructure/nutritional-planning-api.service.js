import { apiService } from '../../shared/infrastructure/api.service'
import { NutritionalPlanAssembler } from './nutritional-plan.assembler'

export const nutritionalPlanningApiService = {
  async fetchPlans() {
    const plans = await apiService.get('/nutritional-plans')
    return (Array.isArray(plans) ? plans : []).map(NutritionalPlanAssembler.fromApi)
  },

  async createPlan(payload) {
    const created = await apiService.post('/nutritional-plans', {
      name: payload.name,
      calorieTarget: payload.calorieTarget,
      proteinGrams: payload.proteinGrams,
      carbsGrams: payload.carbsGrams,
      fatGrams: payload.fatGrams,
    })
    return NutritionalPlanAssembler.fromApi(created)
  },

  async fetchWeeklyDiet(planId) {
    return apiService.get(`/nutritional-plans/${planId}/weekly-diet`)
  },
}
