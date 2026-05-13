import { apiService } from '../../shared/infrastructure/api.service'
import { ProgressTrackingAssembler } from './progress-tracking.assembler'

export const progressTrackingApiService = {
  async fetchSummary() {
    const payload = await apiService.get('/progress-tracking/summary')
    return {
      adherence: ProgressTrackingAssembler.adherenceFromApi(payload.adherence),
      report: ProgressTrackingAssembler.reportFromApi(payload.report),
    }
  },
}
