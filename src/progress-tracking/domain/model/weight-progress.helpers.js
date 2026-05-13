function normalizeGoal(goal) {
  return goal?.value ?? goal
}

export function sortWeightRecordsByDate(weightRecords = []) {
  return [...weightRecords].sort((first, second) => new Date(first.date) - new Date(second.date))
}

export function getInitialWeight(weightRecords = [], patientProfile = null) {
  const sortedRecords = sortWeightRecordsByDate(weightRecords)
  return sortedRecords[0]?.weightKg ?? patientProfile?.healthData?.weightKg ?? null
}

export function getCurrentWeight(weightRecords = [], patientProfile = null) {
  const sortedRecords = sortWeightRecordsByDate(weightRecords)
  return sortedRecords.at(-1)?.weightKg ?? patientProfile?.healthData?.weightKg ?? null
}

export function getTargetWeight(patientProfile = null, initialWeight = null) {
  if (patientProfile?.targetWeightKg) return Number(patientProfile.targetWeightKg)
  if (!initialWeight) return null

  const goal = normalizeGoal(patientProfile?.nutritionalGoal)
  if (goal === 'LOSE_WEIGHT' || goal === 'bajar-peso') return Number((initialWeight - 6).toFixed(1))
  if (goal === 'GAIN_MUSCLE' || goal === 'ganar-masa') return Number((initialWeight + 4).toFixed(1))
  return Number(initialWeight)
}

export function calculateWeightChange(initialWeight, currentWeight) {
  if (initialWeight == null || currentWeight == null) return null
  return Number((currentWeight - initialWeight).toFixed(1))
}

export function calculateRemainingToGoal(currentWeight, targetWeight, nutritionalGoal = null) {
  if (currentWeight == null || targetWeight == null) return null

  const goal = normalizeGoal(nutritionalGoal)
  const remaining =
    goal === 'GAIN_MUSCLE' || goal === 'ganar-masa'
      ? targetWeight - currentWeight
      : currentWeight - targetWeight

  return Number(Math.max(remaining, 0).toFixed(1))
}

export function calculateTargetWeightByGoal(initialWeight, nutritionalGoal) {
  return getTargetWeight({ nutritionalGoal }, initialWeight)
}
