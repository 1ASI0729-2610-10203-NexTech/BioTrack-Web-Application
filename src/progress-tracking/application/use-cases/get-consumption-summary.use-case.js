import { progressTrackingRepository } from '../../infrastructure/progress-tracking.repository.js'
import { calorieProgressPercent, formatCaloriesDisplay } from '../../domain/services/calorie-balance.service.js'

const MONTHS = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
]

const WEEKDAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

function formatSpanishLongDate(isoDate) {
  const [year, month, day] = isoDate.split('-').map((part) => Number(part))
  const date = new Date(year, month - 1, day)
  const label = WEEKDAYS[date.getDay()]
  return `${label} ${day} de ${MONTHS[month - 1]}, ${year}`
}

export async function getConsumptionSummary() {
  const record = await progressTrackingRepository.getConsumptionSummary()
  const calorieProgress = calorieProgressPercent(record.consumedCalories, record.targetCalories)
  const formattedDate = formatSpanishLongDate(record.date)
  const formattedConsumed = formatCaloriesDisplay(record.consumedCalories)
  const formattedTarget = formatCaloriesDisplay(record.targetCalories)
  return { record, calorieProgress, formattedDate, formattedConsumed, formattedTarget }
}
