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
  // TS06 — GET /api/v1/patients/{id}/food-log
  async fetchFoodLogs(patientId) {
    const logs = await apiService.get(`/patients/${patientId}/food-log`)
    return (Array.isArray(logs) ? logs : []).map(mapFoodLog)
  },

  // TS06 — POST /api/v1/patients/{id}/food-log
  async createFoodLog(patientId, payload) {
    const created = await apiService.post(`/patients/${patientId}/food-log`, payload)
    return mapFoodLog(created)
  },

  // TS06 — GET /api/v1/patients/{id}/activity-log
  async fetchActivityLogs(patientId) {
    const logs = await apiService.get(`/patients/${patientId}/activity-log`)
    return (Array.isArray(logs) ? logs : []).map(mapActivityLog)
  },

  // TS06 — POST /api/v1/patients/{id}/activity-log
  async createActivityLog(patientId, payload) {
    const created = await apiService.post(`/patients/${patientId}/activity-log`, payload)
    return mapActivityLog(created)
  },

  // TS06 — GET /api/v1/patients/{id}/weight
  async fetchWeightRecords(patientId) {
    const records = await apiService.get(`/patients/${patientId}/weight`)
    return (Array.isArray(records) ? records : []).map(mapWeightRecord)
  },

  async fetchRawWeightRecords(patientId) {
    const records = await apiService.get(`/patients/${patientId}/weight`)
    return Array.isArray(records) ? records : []
  },

  // TS06 — PATCH /api/v1/patients/{id}/weight
  async createWeightRecord(patientId, payload) {
    const created = await apiService.patch(`/patients/${patientId}/weight`, payload)
    return mapWeightRecord(created)
  },

  async updateWeightRecord(patientId, payload) {
    const updated = await apiService.patch(`/patients/${patientId}/weight`, payload)
    return mapWeightRecord(updated)
  },
}
