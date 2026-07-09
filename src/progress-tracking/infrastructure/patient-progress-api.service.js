import { apiService } from '../../shared/infrastructure/api.service'

export const patientProgressApiService = {
  async fetchFoodLogs(_patientProfileId) {
    return []
  },

  async fetchActivityLogs(_patientProfileId) {
    const data = await apiService.get('/progress/activity-history')
    return (Array.isArray(data) ? data : []).map((r) => ({
      id: r.id,
      activityType: r.activityType,
      durationMinutes: r.durationMinutes,
      burnedCalories: r.caloriesBurned,
      intensity: r.intensity ?? 'media',
      date: r.loggedAt ? new Date(r.loggedAt).toISOString().slice(0, 10) : null,
    }))
  },

  async fetchWeightRecords(_patientProfileId) {
    return []
  },

  async createFoodLog(_patientProfileId, payload) {
    const data = await apiService.post('/progress/food-entries', {
      mealType: payload.mealType,
      foodName: payload.description,
      calories: payload.calories,
    })
    return {
      id: data.id,
      mealType: data.mealType,
      description: data.foodName,
      calories: Number(data.calories),
      date: data.loggedAt ? new Date(data.loggedAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      loggedAt: data.loggedAt,
    }
  },

  async createActivityLog(_patientProfileId, payload) {
    const data = await apiService.post('/progress/activity-entries', {
      activityType: payload.activityType,
      durationMinutes: payload.durationMinutes,
    })
    return {
      id: data.id,
      activityType: data.activityType,
      durationMinutes: data.durationMinutes,
      burnedCalories: data.caloriesBurned,
      intensity: payload.intensity ?? 'media',
      date: data.loggedAt ? new Date(data.loggedAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
    }
  },

  async createWeightRecord(_patientProfileId, payload) {
    const data = await apiService.post('/progress/weight-records', {
      weightKg: payload.weightKg,
      notes: payload.comment ?? '',
    })
    return {
      id: data.id,
      weightKg: data.weightKg,
      date: data.recordedAt ? new Date(data.recordedAt).toISOString().slice(0, 10) : payload.date,
      type: payload.type ?? 'PROGRESS',
      source: payload.source ?? 'MANUAL',
      comment: payload.comment ?? '',
    }
  },

  async logFood(mealType, foodName, calories) {
    return apiService.post('/progress/food-entries', { mealType, foodName, calories })
  },

  async logActivity(activityType, durationMinutes) {
    return apiService.post('/progress/activity-entries', { activityType, durationMinutes })
  },

  async recordWeight(weightKg, notes = '') {
    return apiService.post('/progress/weight-records', { weightKg, notes })
  },

  async fetchCharts() {
    return apiService.get('/progress/charts')
  },

  async fetchActivityHistory() {
    return apiService.get('/progress/activity-history')
  },
}
