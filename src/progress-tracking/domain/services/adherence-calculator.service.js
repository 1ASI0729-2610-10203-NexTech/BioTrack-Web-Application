/**
 * @param {{ day: string, percent: number }[]} dayDetails
 */
export function averageDayAdherence(dayDetails) {
  if (!dayDetails.length) return 0
  const sum = dayDetails.reduce((acc, row) => acc + Number(row.percent ?? 0), 0)
  return Math.round(sum / dayDetails.length)
}

/**
 * @param {boolean[]} weekFlags
 */
export function countActiveDays(weekFlags) {
  return weekFlags.filter(Boolean).length
}
