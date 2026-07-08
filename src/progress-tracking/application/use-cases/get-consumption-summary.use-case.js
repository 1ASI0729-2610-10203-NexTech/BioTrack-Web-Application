import { progressTrackingRepository } from '../../infrastructure/progress-tracking.repository.js'
import { calorieProgressPercent, formatCaloriesDisplay } from '../../domain/services/calorie-balance.service.js'
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

export async function getConsumptionSummary() {
  const record = await progressTrackingRepository.getConsumptionSummary()
  const calorieProgress = calorieProgressPercent(record.consumedCalories, record.targetCalories)
  const formattedDate = formatLongDate(record.date)
  const formattedConsumed = formatCaloriesDisplay(record.consumedCalories)
  const formattedTarget = formatCaloriesDisplay(record.targetCalories)
  return { record, calorieProgress, formattedDate, formattedConsumed, formattedTarget }
}
