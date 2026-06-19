import { apiService } from '../../shared/infrastructure/api.service'

export const patientProgressApiService = {
  async logFood(mealType, foodName, calories) {
    return apiService.post('/progress/food-log', { mealType, foodName, calories })
  },

  async logActivity(activityType, durationMinutes) {
    return apiService.post('/progress/activity-log', { activityType, durationMinutes })
  },

  async recordWeight(weightKg, notes = '') {
    return apiService.post('/progress/weight-update', { weightKg, notes })
  },

  async fetchCharts() {
    return apiService.get('/progress/charts')
  },

  async fetchActivityHistory() {
    return apiService.get('/progress/activity-history')
  },
}
