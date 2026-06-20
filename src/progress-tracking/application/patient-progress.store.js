import { defineStore } from 'pinia'
import { FoodLog } from '../domain/model/food-log.entity'
import { AdherencePercentage } from '../domain/model/adherence-percentage.value-object'
import { ActivityRecord } from '../domain/model/activity-record.entity'
import { WeightRecord } from '../domain/model/weight-record.entity'
import { ProgressSummary } from '../domain/model/progress-summary.entity'
import { useIdentityAccessStore } from '../../identity-access/application/identity-access.store'
import { patientPlanApiService } from '../../nutritional-planning/infrastructure/patient-plan-api.service'
import { patientProfileApiService } from '../../patient-profile/infrastructure/patient-profile-api.service'
import { calculateBMI, getBMIStatus } from '../../patient-profile/domain/model/bmi.value-object'
import { patientProgressApiService } from '../infrastructure/patient-progress-api.service'
import {
  calculateRemainingToGoal,
  calculateWeightChange,
  getCurrentWeight,
  getInitialWeight,
  getTargetWeight,
  sortWeightRecordsByDate,
} from '../domain/model/weight-progress.helpers'

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

async function resolvePatientContext() {
  const identityStore = useIdentityAccessStore()
  const userId = identityStore.currentUser?.id
  if (!userId) throw new Error('No existe un usuario autenticado.')
  const planResponse = await patientPlanApiService.fetchCurrentPlan(userId)
  const profile = await patientProfileApiService.fetchByUserId(userId)
  if (!profile?.id) throw new Error('No existe un perfil de paciente asociado al usuario.')
  return {
    userId,
    patientProfileId: profile.id,
    profile,
    planResponse,
  }
}

export const usePatientProgressStore = defineStore('patient-progress', {
  state: () => ({
    foodLogs: [],
    activityLogs: [],
    weightRecords: [],
    dailyCalories: 0,
    dailyConsumedCalories: 0,
    dailyAdherence: new AdherencePercentage(0),
    adherenceSummary: new AdherencePercentage(0),
    progressSummary: null,
    patientProfile: null,
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
      return getCurrentWeight(state.weightRecords, state.patientProfile)
    },
    initialWeight(state) {
      return getInitialWeight(state.weightRecords, state.patientProfile)
    },
    targetWeight(state) {
      return getTargetWeight(state.patientProfile, this.initialWeight)
    },
    currentBMI(state) {
      const heightCm = state.patientProfile?.healthData?.heightCm
      if (!this.currentWeight || !heightCm) return null
      return calculateBMI(this.currentWeight, heightCm)?.value ?? null
    },
    bmiStatus() {
      return getBMIStatus(this.currentBMI)
    },
    weightChange() {
      return calculateWeightChange(this.initialWeight, this.currentWeight)
    },
    remainingToGoal(state) {
      return calculateRemainingToGoal(
        this.currentWeight,
        this.targetWeight,
        state.patientProfile?.nutritionalGoal,
      )
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
      return sortWeightRecordsByDate(state.weightRecords).reverse()
    },
  },
  actions: {
    async fetchProgressData() {
      this.loading = true
      this.error = ''
      try {
        const { patientProfileId, profile, planResponse } = await resolvePatientContext()
        this.patientProfile = profile
        let [foodLogs, activityLogs, weightRecords] = await Promise.all([
          patientProgressApiService.fetchFoodLogs(patientProfileId),
          patientProgressApiService.fetchActivityLogs(patientProfileId),
          patientProgressApiService.fetchWeightRecords(patientProfileId),
        ])
        const hasInitialWeight = weightRecords.length === 0
        if (hasInitialWeight && profile?.healthData?.weightKg) {
          const initialRecord = await this.createInitialWeightRecordFromProfile(profile, weightRecords)
          weightRecords = initialRecord ? [...weightRecords, initialRecord] : weightRecords
        }
        this.foodLogs = foodLogs
        this.activityLogs = activityLogs
        this.weightRecords = sortWeightRecordsByDate(weightRecords)
        this.dailyCalories = planResponse?.entity?.dailyCalories ?? 0
        this.calculateDailyCalories()
        this.calculateDailyAdherence()
        this.calculateWeeklyAdherence()
        return this.progressSummary
      } catch (error) {
        this.error = 'No se pudo cargar el progreso.'
        throw error
      } finally {
        this.loading = false
      }
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
      const { patientProfileId, planResponse } = await resolvePatientContext()
      const created = await patientProgressApiService.createFoodLog(patientProfileId, {
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
        this.dailyCalories > 0
          ? (this.dailyConsumedCalories / this.dailyCalories) * 100
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
    setDailyCalories(dailyCalories) {
      this.dailyCalories = Number(dailyCalories ?? 0)
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
      const { patientProfileId } = await resolvePatientContext()
      const created = await patientProgressApiService.createActivityLog(patientProfileId, {
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
      try {
        const { patientProfileId, profile } = await resolvePatientContext()
        const created = await patientProgressApiService.createWeightRecord(patientProfileId, {
          date: weightRecord.date,
          weightKg: Number(weightRecord.weightKg),
          type: 'PROGRESS',
          source: 'WEEKLY_UPDATE',
          comment: weightRecord.comment ?? '',
        })
        this.weightRecords = sortWeightRecordsByDate([...this.weightRecords, created])
        if (profile) {
          const bmi = calculateBMI(Number(weightRecord.weightKg), profile.healthData?.heightCm)
          this.patientProfile = await patientProfileApiService.update(profile.id, {
            weightKg: Number(weightRecord.weightKg),
            bmi: bmi ? Number(bmi.value.toFixed(2)) : null,
            updatedAt: new Date().toISOString(),
          })
        }
        this.weightSavedRecently = true
        this.calculateProgressSummary()
        return true
      } finally {
        this.loading = false
      }
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
        currentBMI: this.currentBMI,
        bmiStatus: this.bmiStatus,
        remainingToGoal: this.remainingToGoal,
        weeklyAdherence: this.weeklyAdherencePercentage,
        registeredDays: this.registeredDaysCount,
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
      return this.weightRecords.length > 1 || this.foodLogs.length > 0
    },
    async createInitialWeightRecordFromProfile(profile, existingRecords = []) {
      if (!profile?.id || !profile?.healthData?.weightKg) return null
      const sortedRecords = sortWeightRecordsByDate(existingRecords)
      const initialDate = sortedRecords.length
        ? new Date(new Date(sortedRecords[0].date).getTime() - 24 * 60 * 60 * 1000)
            .toISOString()
            .slice(0, 10)
        : profile.createdAt?.toISOString?.().slice(0, 10) ?? getTodayIsoDate()
      return patientProgressApiService.createWeightRecord(profile.id, {
        date: initialDate,
        weightKg: profile.healthData.weightKg,
        type: 'INITIAL',
        source: 'HEALTH_PROFILE',
        comment: 'Peso inicial registrado desde perfil de salud',
      })
    },
  },
})
