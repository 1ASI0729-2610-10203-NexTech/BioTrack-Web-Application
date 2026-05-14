import { progressTrackingRepository } from '../../infrastructure/progress-tracking.repository.js'

export async function getAdherenceSummary() {
  return progressTrackingRepository.getAdherenceSummary()
}
