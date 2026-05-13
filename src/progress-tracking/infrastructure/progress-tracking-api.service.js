import { apiService } from '../../shared/infrastructure/api.service'
import { ProgressTrackingAssembler } from './progress-tracking.assembler'

export const progressTrackingApiService = {
  async fetchSummary(patientId = 1) {
    const [foodLogs, reports] = await Promise.all([
      apiService.get('/food-logs'),
      apiService.get('/evolution-reports'),
    ])
    const patientLogs = foodLogs.filter((log) => log.patientId === patientId)
    const recordedDays = new Set(patientLogs.map((log) => log.date)).size
    const report =
      reports.find((candidate) => candidate.patientId === patientId) ??
      { id: null, patientId, dataPoints: [] }
    return {
      adherence: ProgressTrackingAssembler.adherenceFromApi({
        patientId,
        recordedDays,
        targetDays: 7,
      }),
      report: ProgressTrackingAssembler.reportFromApi(report),
    }
  },
}
