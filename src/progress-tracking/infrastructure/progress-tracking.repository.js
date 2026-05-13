import { progressTrackingMockRoot } from './progress-tracking.mock-data.js'
import { ConsumptionRecord } from '../domain/model/consumption-record.entity.js'
import { AdherenceSummary } from '../domain/model/adherence-summary.entity.js'
import { ProgressOverview } from '../domain/model/progress-summary.entity.js'
import { WeeklyWeightSnapshot } from '../domain/model/weight-record.entity.js'
import { ActivityRecord } from '../domain/model/activity-record.entity.js'

const base = () => structuredClone(progressTrackingMockRoot)

let state = base()

function mapConsumption() {
  const row = state.consumption
  return new ConsumptionRecord({
    date: row.date,
    targetCalories: row.targetCalories,
    consumedCalories: row.consumedCalories,
    dailyAdherence: row.dailyAdherence,
    meals: row.meals,
    weekActivity: row.weekActivity,
  })
}

function mapAdherence() {
  const row = state.adherence
  return new AdherenceSummary({
    weekLabel: row.weekLabel,
    weeklyAdherence: row.weeklyAdherence,
    registeredDays: row.registeredDays,
    totalDays: row.totalDays,
    mealsAccordingToPlan: row.mealsAccordingToPlan,
    nutritionistAlertSent: row.nutritionistAlertSent,
    dayDetails: row.dayDetails,
  })
}

function mapProgressOverview() {
  const row = state.progress
  return new ProgressOverview({
    initialWeight: row.initialWeight,
    currentWeight: row.currentWeight,
    goalWeight: row.goalWeight,
    totalLost: row.totalLost,
    weeklyWeights: row.weeklyWeights,
    averageAdherence: row.averageAdherence,
    activeDays: row.activeDays,
    targetActiveDays: row.targetActiveDays,
    registeredDays: row.registeredDays,
    targetRegisteredDays: row.targetRegisteredDays,
    activeWeeks: row.activeWeeks,
  })
}

function mapWeeklyWeight() {
  const row = state.weeklyWeight
  return new WeeklyWeightSnapshot({
    weekLabel: row.weekLabel,
    currentWeight: row.currentWeight,
    previousWeight: row.previousWeight,
    variation: row.variation,
    bmi: row.bmi,
    goalWeight: row.goalWeight,
    latestWeeks: row.latestWeeks,
  })
}

function mapActivity() {
  const row = state.activity
  return new ActivityRecord({
    type: row.activityName,
    activityName: row.activityName,
    durationLabel: row.duration,
    durationMinutes: 45,
    intensity: row.intensity,
    burnedCalories: row.burnedCalories,
    date: row.date,
    notes: row.notes,
  })
}

export const progressTrackingRepository = {
  getSessionUser() {
    return { ...state.user }
  },

  async getConsumptionSummary() {
    return mapConsumption()
  },

  async getProgressOverview() {
    return mapProgressOverview()
  },

  async getAdherenceSummary() {
    return mapAdherence()
  },

  async getWeeklyWeightSnapshot() {
    return mapWeeklyWeight()
  },

  async getActivityRegistration() {
    return {
      record: mapActivity(),
      weekActivity: [...state.activity.weekActivity],
    }
  },

  async getActivityRecord() {
    return mapActivity()
  },

  /**
   * @param {{ weightKg: number }} payload
   */
  async updateWeeklyWeight(payload) {
    const next = Number(payload.weightKg)
    if (Number.isFinite(next)) {
      const previous = state.weeklyWeight.currentWeight
      state.weeklyWeight.previousWeight = previous
      state.weeklyWeight.currentWeight = next
      state.weeklyWeight.variation = Math.round((next - previous) * 10) / 10
      const last = state.weeklyWeight.latestWeeks[state.weeklyWeight.latestWeeks.length - 1]
      if (last) {
        last.weightKg = next
      }
      state.progress.currentWeight = next
      state.progress.totalLost = Math.round((state.progress.initialWeight - next) * 10) / 10
      const weights = state.progress.weeklyWeights
      weights[weights.length - 1] = next
    }
    return mapWeeklyWeight()
  },

  /**
   * @param {{ activityName?: string, intensity?: string, duration?: string, burnedCalories?: number, notes?: string }} payload
   */
  async registerActivity(payload) {
    state.activity = {
      ...state.activity,
      activityName: payload.activityName ?? state.activity.activityName,
      intensity: payload.intensity ?? state.activity.intensity,
      duration: payload.duration ?? state.activity.duration,
      burnedCalories: Number(payload.burnedCalories ?? state.activity.burnedCalories),
      notes: payload.notes ?? state.activity.notes,
    }
    return mapActivity()
  },
}
