import { apiService } from '../../shared/infrastructure/api.service'
import { patientPlanApiService } from './patient-plan-api.service'

export const nutritionalPlanningApiService = {
  async fetchCurrentPlan(patientId = 1) {
    const response = await patientPlanApiService.fetchCurrentPlan(patientId)
    return response?.entity ?? null
  },
}
