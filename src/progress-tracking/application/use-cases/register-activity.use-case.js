import { progressTrackingRepository } from '../../infrastructure/progress-tracking.repository.js'
import { resolveInitialLocale } from '../../../locales'

function formatLongDate(isoDate) {
  const [year, month, day] = isoDate.split('-').map((part) => Number(part))
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString(resolveInitialLocale(), {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export async function loadActivityRecord() {
  const { record, weekActivity } = await progressTrackingRepository.getActivityRegistration()
  const formattedDate = formatLongDate(record.date)
  return { record, formattedDate, weekActivity }
}

export async function registerActivity(payload) {
  const record = await progressTrackingRepository.registerActivity(payload)
  const { weekActivity } = await progressTrackingRepository.getActivityRegistration()
  const formattedDate = formatLongDate(record.date)
  return { record, formattedDate, weekActivity }
}
