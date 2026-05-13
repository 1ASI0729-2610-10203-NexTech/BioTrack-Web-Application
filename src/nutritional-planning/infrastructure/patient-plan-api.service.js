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

function mapPlan(payload, nutritionistName = 'Dra. Ana Torres') {
  return new PatientPlan({
    id: payload.id,
    title: payload.name,
    nutritionist: nutritionistName,
    date: formatDate(payload.createdAt),
    targetCalories: payload.dailyCalories,
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
    const plans = await apiService.get('/patient-plans')
    const plan = plans.find((candidate) => candidate.patientId === patientId)
    if (!plan) return null
    const nutritionists = await apiService.get('/nutritionists')
    return {
      raw: plan,
      entity: mapPlan(
        plan,
        nutritionists.find((nutritionist) => nutritionist.id === plan.nutritionistId)?.fullName,
      ),
    }
  },

  async fetchWeeklyDiet(planId) {
    const diets = await apiService.get('/weekly-diets')
    const diet = diets.find((candidate) => candidate.planId === planId)
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

  async acceptPlan(planId) {
    return apiService.patch(`/patient-plans/${planId}`, {
      status: 'ACTIVATED',
      activatedAt: new Date().toISOString().slice(0, 10),
      rejectedReason: null,
    })
  },

  async rejectPlan(planId, rejectedReason) {
    return apiService.patch(`/patient-plans/${planId}`, {
      status: 'REJECTED',
      rejectedReason,
    })
  },
}
