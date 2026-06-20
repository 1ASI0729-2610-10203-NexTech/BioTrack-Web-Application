import { apiService } from '../../shared/infrastructure/api.service'

function mapPlan(payload) {
  const cal = payload.calorieTarget || 1
  const proteinPct = Math.round((payload.proteinGrams * 4 / cal) * 100)
  const carbsPct = Math.round((payload.carbsGrams * 4 / cal) * 100)
  const fatPct = 100 - proteinPct - carbsPct
  return {
    id: payload.id,
    title: payload.name,
    name: payload.name,
    dailyCalories: payload.calorieTarget,
    calorieTarget: payload.calorieTarget,
    goal: 'Mantener peso',
    nutritionist: 'Nutricionista asignado',
    date: payload.createdAt ? new Date(payload.createdAt).toLocaleDateString('es-PE') : '',
    macros: { proteins: proteinPct, carbohydrates: carbsPct, fats: fatPct },
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

  async fetchCurrentPlan(_userId) {
    const plans = await apiService.get('/nutritional-plans')
    const mapped = (Array.isArray(plans) ? plans : []).map(mapPlan)
    const active = mapped.find((p) => p.status === 'ACTIVATED') ?? null
    if (!active) return null
    return { entity: { dailyCalories: active.dailyCalories }, raw: active }
  },

  async fetchWeeklyDiet(planId) {
    return apiService.get(`/nutritional-plans/${planId}/weekly-diet`)
  },
}
