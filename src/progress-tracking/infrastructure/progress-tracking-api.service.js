import { apiService } from '../../shared/infrastructure/api.service'
import { ProgressTrackingAssembler } from './progress-tracking.assembler'

export const progressTrackingApiService = {
  // GET /api/v1/progress/charts
  async fetchSummary(patientId) {
    const charts = await apiService.get('/progress/charts').catch(() => null)
    const evolutionReport = charts ?? { id: null, patientId, dataPoints: [] }
    return {
      adherence: ProgressTrackingAssembler.adherenceFromApi({
        patientId,
        recordedDays: 0,
        targetDays: 7,
      }),
      report: ProgressTrackingAssembler.reportFromApi(evolutionReport),
    }
  },
}
