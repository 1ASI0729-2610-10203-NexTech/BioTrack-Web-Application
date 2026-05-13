import { apiService } from '../../shared/infrastructure/api.service'
import { ActivityRecord } from '../domain/model/activity-record.entity'
import { FoodLog } from '../domain/model/food-log.entity'
import { WeightRecord } from '../domain/model/weight-record.entity'

const jsonServerBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1')
  .replace(/\/api\/v1\/?$/, '')
  .replace(/\/$/, '')

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
  async fetchFoodLogs(patientId) {
    const logs = await apiService.get(`${jsonServerBaseUrl}/foodLogs`)
    return logs.filter((log) => log.patientId === patientId).map(mapFoodLog)
  },

  async createFoodLog(payload) {
    const created = await apiService.post(`${jsonServerBaseUrl}/foodLogs`, payload)
    return mapFoodLog(created)
  },

  async fetchActivityLogs(patientId) {
    const logs = await apiService.get(`${jsonServerBaseUrl}/activityLogs`)
    return logs.filter((log) => log.patientId === patientId).map(mapActivityLog)
  },

  async createActivityLog(payload) {
    const created = await apiService.post(`${jsonServerBaseUrl}/activityLogs`, payload)
    return mapActivityLog(created)
  },

  async fetchWeightRecords(patientId) {
    const records = await apiService.get(`${jsonServerBaseUrl}/weightRecords`)
    return records.filter((record) => record.patientId === patientId).map(mapWeightRecord)
  },

  async fetchRawWeightRecords(patientId) {
    const records = await apiService.get(`${jsonServerBaseUrl}/weightRecords`)
    return records.filter((record) => record.patientId === patientId)
  },

  async createWeightRecord(payload) {
    const created = await apiService.post(`${jsonServerBaseUrl}/weightRecords`, payload)
    return mapWeightRecord(created)
  },

  async updateWeightRecord(recordId, payload) {
    const updated = await apiService.patch(`${jsonServerBaseUrl}/weightRecords/${recordId}`, payload)
    return mapWeightRecord(updated)
  },
}
