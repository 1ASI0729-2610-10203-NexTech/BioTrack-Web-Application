import { progressTrackingRepository } from '../../infrastructure/progress-tracking.repository.js'

export async function loadWeeklyWeightSnapshot() {
  return progressTrackingRepository.getWeeklyWeightSnapshot()
}

/**
 * @param {{ weightKg: number }} payload
 */
export async function updateWeeklyWeight(payload) {
  return progressTrackingRepository.updateWeeklyWeight(payload)
}
