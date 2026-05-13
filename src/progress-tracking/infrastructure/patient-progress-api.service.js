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
    weightKg: payload.weightKg,
    date: payload.date,
    comment: payload.comment,
  })
}

export const patientProgressApiService = {
  async fetchFoodLogs(patientId) {
    const logs = await apiService.get('/food-logs')
    return logs.filter((log) => log.patientId === patientId).map(mapFoodLog)
  },

  async createFoodLog(payload) {
    const created = await apiService.post('/food-logs', payload)
    return mapFoodLog(created)
  },

  async fetchActivityLogs(patientId) {
    const logs = await apiService.get('/activity-logs')
    return logs.filter((log) => log.patientId === patientId).map(mapActivityLog)
  },

  async createActivityLog(payload) {
    const created = await apiService.post('/activity-logs', payload)
    return mapActivityLog(created)
  },

  async fetchWeightRecords(patientId) {
    const records = await apiService.get('/weight-records')
    return records.filter((record) => record.patientId === patientId).map(mapWeightRecord)
  },

  async createWeightRecord(payload) {
    const created = await apiService.post('/weight-records', payload)
    return mapWeightRecord(created)
  },
}
