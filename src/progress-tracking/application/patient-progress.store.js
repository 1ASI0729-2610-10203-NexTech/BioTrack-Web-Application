import { defineStore } from 'pinia'
import { FoodLog } from '../domain/model/food-log.entity'
import { AdherencePercentage } from '../domain/model/adherence-percentage.value-object'
import { ActivityRecord } from '../domain/model/activity-record.entity'
import { WeightRecord } from '../domain/model/weight-record.entity'
import { ProgressSummary } from '../domain/model/progress-summary.entity'
import { useIdentityAccessStore } from '../../identity-access/application/identity-access.store'
import { patientPlanApiService } from '../../nutritional-planning/infrastructure/patient-plan-api.service'
import { patientProfileApiService } from '../../patient-profile/infrastructure/patient-profile-api.service'
import { calculateBMI } from '../../patient-profile/domain/model/bmi.value-object'
import { patientProgressApiService } from '../infrastructure/patient-progress-api.service'

function getTodayIsoDate() {
  return new Date().toISOString().slice(0, 10)
}

function getWeekStart() {
  const current = new Date()
  const day = current.getDay()
  const diff = current.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(current.setDate(diff))
  monday.setHours(0, 0, 0, 0)
  return monday
}

export const usePatientProgressStore = defineStore('patient-progress', {
  state: () => ({
    foodLogs: [],
    activityLogs: [],
    weightRecords: [],
    dailyTargetCalories: 1850,
    dailyConsumedCalories: 0,
    dailyAdherence: new AdherencePercentage(0),
    adherenceSummary: new AdherencePercentage(0),
    progressSummary: null,
    targetWeight: 72,
    loading: false,
    error: '',
    savedRecently: false,
    activitySavedRecently: false,
    weightSavedRecently: false,
  }),
  getters: {
    getTodayFoodLogs(state) {
      const today = getTodayIsoDate()
      return state.foodLogs.filter((log) => log.date === today)
    },
    currentWeight(state) {
      return state.weightRecords[state.weightRecords.length - 1]?.weightKg ?? 0
    },
    initialWeight(state) {
      return state.weightRecords[0]?.weightKg ?? 0
    },
    weeklyActivityMinutes(state) {
      return this.getWeeklyActivityLogs.reduce(
        (total, record) => total + record.durationMinutes,
        0,
      )
    },
    weeklyBurnedCalories() {
      return this.getWeeklyActivityLogs.reduce(
        (total, record) => total + record.burnedCalories,
        0,
      )
    },
    registeredDaysCount(state) {
      return new Set(state.foodLogs.map((log) => log.date)).size
    },
    weeklyAdherencePercentage() {
      return this.adherenceSummary.value
    },
    getWeeklyActivityLogs(state) {
      const weekStart = getWeekStart()
      return state.activityLogs.filter((record) => new Date(record.date) >= weekStart)
    },
    getWeightHistory(state) {
      return [...state.weightRecords].reverse()
    },
  },
  actions: {
    async fetchProgressData() {
      this.loading = true
      this.error = ''
      const identityStore = useIdentityAccessStore()
      const patientId = identityStore.currentUser?.id ?? 1
      const [foodLogs, activityLogs, weightRecords, planResponse] = await Promise.all([
        patientProgressApiService.fetchFoodLogs(patientId),
        patientProgressApiService.fetchActivityLogs(patientId),
        patientProgressApiService.fetchWeightRecords(patientId),
        patientPlanApiService.fetchCurrentPlan(patientId),
      ])
      this.foodLogs = foodLogs
      this.activityLogs = activityLogs
      this.weightRecords = weightRecords
      this.dailyTargetCalories = planResponse?.entity?.targetCalories ?? this.dailyTargetCalories
      this.calculateDailyCalories()
      this.calculateDailyAdherence()
      this.calculateWeeklyAdherence()
      this.loading = false
      return this.progressSummary
    },
    async addFoodLog(foodLog) {
      this.error = ''
      this.savedRecently = false
      const today = getTodayIsoDate()
      const duplicatedMeal = this.foodLogs.some(
        (log) => log.date === today && log.mealType === foodLog.mealType,
      )

      if (duplicatedMeal) {
        this.error = 'Ya existe un registro para ese tipo de comida hoy.'
        return false
      }

      this.loading = true
      const identityStore = useIdentityAccessStore()
      const patientId = identityStore.currentUser?.id ?? 1
      const planResponse = await patientPlanApiService.fetchCurrentPlan(patientId)
      const created = await patientProgressApiService.createFoodLog({
        patientId,
        planId: planResponse?.raw?.id,
        date: today,
        mealType: foodLog.mealType,
        description: foodLog.description,
        calories: Number(foodLog.calories),
      })
      this.foodLogs.push(created)
      this.calculateDailyCalories()
      this.calculateDailyAdherence()
      this.calculateWeeklyAdherence()
      this.savedRecently = true
      this.loading = false
      return true
    },
    calculateDailyCalories() {
      this.dailyConsumedCalories = this.getTodayFoodLogs.reduce(
        (total, log) => total + Number(log.calories || 0),
        0,
      )
      return this.dailyConsumedCalories
    },
    calculateDailyAdherence() {
      const percentage =
        this.dailyTargetCalories > 0
          ? (this.dailyConsumedCalories / this.dailyTargetCalories) * 100
          : 0
      this.dailyAdherence = new AdherencePercentage(percentage)
      return this.dailyAdherence
    },
    clearTodayLogs() {
      const today = getTodayIsoDate()
      this.foodLogs = this.foodLogs.filter((log) => log.date !== today)
      this.dailyConsumedCalories = 0
      this.dailyAdherence = new AdherencePercentage(0)
      this.savedRecently = false
      this.error = ''
      this.calculateWeeklyAdherence()
    },
    setDailyTargetCalories(targetCalories) {
      this.dailyTargetCalories = targetCalories
      this.calculateDailyAdherence()
    },
    calculateActivityCalories(activity) {
      const factors = { baja: 3, media: 6, alta: 9 }
      return Number(activity.durationMinutes) * (factors[activity.intensity] ?? 0)
    },
    async addActivityLog(activity) {
      this.error = ''
      this.activitySavedRecently = false
      this.loading = true
      const burnedCalories = this.calculateActivityCalories(activity)
      const identityStore = useIdentityAccessStore()
      const created = await patientProgressApiService.createActivityLog({
        patientId: identityStore.currentUser?.id ?? 1,
        date: getTodayIsoDate(),
        activityType: activity.type,
        durationMinutes: Number(activity.durationMinutes),
        intensity: activity.intensity,
        burnedCalories,
      })
      this.activityLogs.push(created)
      this.activitySavedRecently = true
      this.loading = false
      this.calculateProgressSummary()
      return true
    },
    async updateWeight(weightRecord) {
      this.error = ''
      this.weightSavedRecently = false
      if (this.weightRecords.some((record) => record.date === weightRecord.date)) {
        this.error = 'Ya existe un registro de peso para esa fecha.'
        return false
      }
      this.loading = true
      const identityStore = useIdentityAccessStore()
      const patientId = identityStore.currentUser?.id ?? 1
      const created = await patientProgressApiService.createWeightRecord({
        patientId,
        date: weightRecord.date,
        weightKg: Number(weightRecord.weightKg),
        comment: weightRecord.comment ?? '',
      })
      this.weightRecords.push(created)
      const profile = await patientProfileApiService.fetchByUserId(patientId)
      if (profile) {
        const bmi = calculateBMI(Number(weightRecord.weightKg), profile.healthData.heightCm)
        await patientProfileApiService.update(profile.id, {
          weightKg: Number(weightRecord.weightKg),
          bmi: Number(bmi.value.toFixed(2)),
        })
      }
      this.weightSavedRecently = true
      this.loading = false
      this.calculateProgressSummary()
      return true
    },
    calculateProgressSummary() {
      const averageConsumedCalories = this.registeredDaysCount
        ? Math.round(
            this.foodLogs.reduce((total, log) => total + Number(log.calories || 0), 0) /
              this.registeredDaysCount,
          )
        : 0
      this.progressSummary = new ProgressSummary({
        initialWeight: this.initialWeight,
        currentWeight: this.currentWeight,
        targetWeight: this.targetWeight,
        weeklyAdherence: this.weeklyAdherencePercentage,
        registeredDays: this.registeredDaysCount,
        weeklyActivityMinutes: this.weeklyActivityMinutes,
        weeklyBurnedCalories: this.weeklyBurnedCalories,
        averageConsumedCalories,
      })
      return this.progressSummary
    },
    calculateWeeklyAdherence() {
      const percentage = Math.min((this.registeredDaysCount / 7) * 100, 100)
      this.adherenceSummary = new AdherencePercentage(percentage)
      this.calculateProgressSummary()
      return this.adherenceSummary
    },
    hasEnoughProgressData() {
      return this.weightRecords.length > 1 || this.activityLogs.length > 0 || this.foodLogs.length > 0
    },
  },
})
