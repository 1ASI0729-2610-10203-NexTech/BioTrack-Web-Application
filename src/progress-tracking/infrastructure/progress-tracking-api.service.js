import { apiService } from '../../shared/infrastructure/api.service'

export const progressTrackingApiService = {
  async fetchCharts() {
    return apiService.get('/progress/charts')
  },

  async fetchActivityHistory() {
    return apiService.get('/progress/activity-history')
  },
}
