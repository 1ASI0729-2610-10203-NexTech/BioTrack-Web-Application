import { progressTrackingRepository } from '../../infrastructure/progress-tracking.repository.js'

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

export async function loadActivityRecord() {
  const { record, weekActivity } = await progressTrackingRepository.getActivityRegistration()
  const formattedDate = formatSpanishLongDate(record.date)
  return { record, formattedDate, weekActivity }
}

export async function registerActivity(payload) {
  const record = await progressTrackingRepository.registerActivity(payload)
  const { weekActivity } = await progressTrackingRepository.getActivityRegistration()
  const formattedDate = formatSpanishLongDate(record.date)
  return { record, formattedDate, weekActivity }
}
