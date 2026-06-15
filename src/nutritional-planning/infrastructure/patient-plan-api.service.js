import { apiService } from '../../shared/infrastructure/api.service'
import { PatientPlan } from '../domain/model/patient-plan.entity'
import { WeeklyDiet } from '../domain/model/weekly-diet.entity'

function formatDate(value) {
  if (!value) return ''
  return new Date(value).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function mapPlan(payload) {
  return new PatientPlan({
    id: payload.id,
    title: payload.name,
    nutritionist: payload.nutritionistName ?? 'Nutricionista',
    date: formatDate(payload.createdAt),
    dailyCalories: payload.dailyCalories,
    goal: payload.objective,
    macros: {
      proteins: payload.proteinPercentage,
      carbohydrates: payload.carbohydratePercentage,
      fats: payload.fatPercentage,
    },
    status: payload.status,
  })
}

export const patientPlanApiService = {
  async fetchCurrentPlan(patientId) {
    const plans = await apiService.get('/nutritional-plans', { params: { patientId } })
    const plan = Array.isArray(plans) ? plans.at(-1) : plans
    if (!plan) return null
    return {
      raw: plan,
      entity: mapPlan(plan),
    }
  },

  async fetchWeeklyDiet(planId) {
    const diet = await apiService.get(`/nutritional-plans/${planId}/weekly-diet`)
    const iconByMealType = {
      desayuno: '☀️',
      almuerzo: '🍽️',
      merienda: '🥤',
      cena: '🌙',
    }
    return diet
      ? new WeeklyDiet({
          days: diet.days.map((day) => ({
            ...day,
            meals: day.meals.map((meal) => ({
              ...meal,
              icon: meal.icon ?? iconByMealType[meal.type] ?? '•',
            })),
          })),
        })
      : null
  },

  // TS05 — PATCH /api/v1/nutritional-plans/{planId}/accept
  async acceptPlan(planId) {
    return apiService.patch(`/nutritional-plans/${planId}/accept`)
  },

  // TS05 — PATCH /api/v1/nutritional-plans/{planId}/reject
  async rejectPlan(planId, rejectedReason) {
    return apiService.patch(`/nutritional-plans/${planId}/reject`, { rejectedReason })
  },
}
