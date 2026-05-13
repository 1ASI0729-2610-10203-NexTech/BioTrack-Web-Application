import { EvolutionReport, PlanAdherence } from '../domain/model/progress-tracking.entity'

export const ProgressTrackingAssembler = {
  adherenceFromApi(payload) {
    return new PlanAdherence(payload)
  },
  reportFromApi(payload) {
    return new EvolutionReport(payload)
  },
}
