import { apiService } from '../../shared/infrastructure/api.service'
import { ActivityRecord } from '../domain/model/activity-record.entity'
import { FoodLog } from '../domain/model/food-log.entity'
import { WeightRecord } from '../domain/model/weight-record.entity'

function mapFoodLog(payload) {
  return new FoodLog({
    mealType: payload.mealType,
    description: payload.description,
    calories: payload.calories,
    date: payload.date,
  })
}

function mapActivityLog(payload) {
  return new ActivityRecord({
    type: payload.activityType,
    durationMinutes: payload.durationMinutes,
    intensity: payload.intensity,
    burnedCalories: payload.burnedCalories,
    date: payload.date,
  })
}

function mapWeightRecord(payload) {
  return new WeightRecord({
    id: payload.id,
    patientId: payload.patientId,
    weightKg: payload.weightKg,
    date: payload.date,
    type: payload.type,
    source: payload.source,
    comment: payload.comment,
  })
}

export const patientProgressApiService = {
  // No GET food-log endpoint in backend — return empty
  async fetchFoodLogs(_patientId) {
    return []
  },

  // POST /api/v1/progress/food-entries
  async createFoodLog(patientId, payload) {
    const created = await apiService.post('/progress/food-entries', { ...payload, patientId })
    return mapFoodLog(created)
  },

  // GET /api/v1/progress/activity-history
  async fetchActivityLogs(_patientId) {
    const logs = await apiService.get('/progress/activity-history').catch(() => [])
    return (Array.isArray(logs) ? logs : []).map(mapActivityLog)
  },

  // POST /api/v1/progress/activity-entries
  async createActivityLog(patientId, payload) {
    const created = await apiService.post('/progress/activity-entries', { ...payload, patientId })
    return mapActivityLog(created)
  },

  // No GET weight endpoint in backend — return empty
  async fetchWeightRecords(_patientId) {
    return []
  },

  async fetchRawWeightRecords(_patientId) {
    return []
  },

  // POST /api/v1/progress/weight-records
  async createWeightRecord(patientId, payload) {
    const created = await apiService.post('/progress/weight-records', { ...payload, patientId })
    return mapWeightRecord(created)
  },

  async updateWeightRecord(patientId, payload) {
    return this.createWeightRecord(patientId, payload)
  },
}
