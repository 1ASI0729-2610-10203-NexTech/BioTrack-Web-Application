import { apiService } from '../../shared/infrastructure/api.service'
import { ProgressTrackingAssembler } from './progress-tracking.assembler'

export const progressTrackingApiService = {
  // TS08 — GET /api/v1/patients/{id}/evolution-report + GET /api/v1/patients/{id}/food-log
  async fetchSummary(patientId) {
    const [foodLogs, report] = await Promise.all([
      apiService.get(`/patients/${patientId}/food-log`),
      apiService.get(`/patients/${patientId}/evolution-report`),
    ])
    const logs = Array.isArray(foodLogs) ? foodLogs : []
    const recordedDays = new Set(logs.map((log) => log.date)).size
    const evolutionReport = report ?? { id: null, patientId, dataPoints: [] }
    return {
      adherence: ProgressTrackingAssembler.adherenceFromApi({
        patientId,
        recordedDays,
        targetDays: 7,
      }),
      report: ProgressTrackingAssembler.reportFromApi(evolutionReport),
    }
  },
}
