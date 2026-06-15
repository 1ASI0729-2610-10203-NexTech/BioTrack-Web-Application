import { progressTrackingRepository } from '../../infrastructure/progress-tracking.repository.js'

export async function getProgressOverview() {
  return progressTrackingRepository.getProgressOverview()
}
