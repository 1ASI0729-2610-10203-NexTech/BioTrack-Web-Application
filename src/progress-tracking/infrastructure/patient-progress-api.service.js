import { apiService } from '../../shared/infrastructure/api.service'
import { ActivityRecord } from '../domain/model/activity-record.entity'
import { FoodLog } from '../domain/model/food-log.entity'
import { WeightRecord } from '../domain/model/weight-record.entity'

function chartCollection(charts, ...keys) {
  for (const key of keys) {
    if (Array.isArray(charts?.[key])) return charts[key]
  }
  return []
}

export const patientProgressApiService = {
  async fetchFoodLogs(_patientProfileId) {
    const charts = await apiService.get('/progress/charts')
    return chartCollection(charts, 'foodEntries', 'foodHistory').map((r) => new FoodLog({
      mealType: r.mealType,
      description: r.description ?? r.foodName,
      calories: Number(r.calories),
      date: (r.loggedAt ?? r.date ?? '').slice(0, 10),
    }))
  },

  async fetchActivityLogs(_patientProfileId) {
    const data = await apiService.get('/progress/activity-history')
    return (Array.isArray(data) ? data : []).map((r) => new ActivityRecord({
      type: r.activityType,
      durationMinutes: r.durationMinutes,
      burnedCalories: r.caloriesBurned,
      intensity: r.intensity ?? 'media',
      date: r.loggedAt ? new Date(r.loggedAt).toISOString().slice(0, 10) : null,
    }))
  },

  async fetchWeightRecords(_patientProfileId) {
    const charts = await apiService.get('/progress/charts')
    return chartCollection(charts, 'weightRecords', 'weightHistory').map((r) => new WeightRecord({
      id: r.id,
      weightKg: r.weightKg,
      date: (r.recordedAt ?? r.date ?? '').slice(0, 10),
      type: r.type ?? 'PROGRESS',
      source: r.source ?? 'API',
      comment: r.notes ?? r.comment ?? '',
    }))
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

  async fetchRawWeightRecords() {
    const charts = await apiService.get('/progress/charts')
    return chartCollection(charts, 'weightRecords', 'weightHistory')
  },

  async updateWeightRecord(_recordId, payload) {
    return this.createWeightRecord(null, payload)
  },
}
