import { defineStore } from 'pinia'
import { HealthData } from '../domain/model/health-data.value-object'
import { calculateBMI, getBMIStatus } from '../domain/model/bmi.value-object'
import { useIdentityAccessStore } from '../../identity-access/application/identity-access.store'
import { t } from '../../locales'
import { patientProgressApiService } from '../../progress-tracking/infrastructure/patient-progress-api.service'
import {
  buildWeightGoalMessage,
  calculateRemainingToGoal,
  calculateTargetWeightByGoal,
  getCurrentWeight,
  getInitialWeight,
} from '../../progress-tracking/domain/model/weight-progress.helpers'
import { syncNutritionAccessForUser } from '../../subscriptions-billing/application/subscription-nutrition-access.service'
import { patientProfileApiService } from '../infrastructure/patient-profile-api.service'

const sexToApi = {
  masculino: 'MALE',
  femenino: 'FEMALE',
  otro: 'OTHER',
  'prefiero-no-decir': 'OTHER',
}
const activityToApi = {
  sedentaria: 'LOW',
  baja: 'LOW',
  moderada: 'MODERATE',
  activa: 'HIGH',
  alta: 'HIGH',
}
const goalToApi = {
  'bajar-peso': 'LOSE_WEIGHT',
  'mantener-peso': 'MAINTAIN_WEIGHT',
  'ganar-masa': 'GAIN_MUSCLE',
}

export const usePatientProfileStore = defineStore('patient-profile', {
  state: () => ({
    profile: null,
    healthData: null,
    nutritionalGoal: null,
    dietaryRestrictions: [],
    weightRecords: [],
    isProfileComplete: false,
    profileCompletionEvent: null,
    restrictionsConfirmed: false,
    loading: false,
    error: '',
    savedRecently: false,
  }),
  getters: {
    currentProfile(state) {
      return state.profile
    },
    bmiValue(state) {
      return state.healthData?.bmi?.value ?? 0
    },
    bmiStatus() {
      return getBMIStatus(this.bmiValue)
    },
    initialWeight(state) {
      return getInitialWeight(state.weightRecords, state.profile)
    },
    currentWeight(state) {
      return getCurrentWeight(state.weightRecords, state.profile)
    },
    targetWeight(state) {
      return (
        state.profile?.targetWeightKg ??
        calculateTargetWeightByGoal(this.initialWeight, state.nutritionalGoal)
      )
    },
    weightToGoal(state) {
      return calculateRemainingToGoal(
        this.currentWeight,
        this.targetWeight,
        state.nutritionalGoal,
      )
    },
    weightGoalMessage(state) {
      return buildWeightGoalMessage(
        this.targetWeight,
        this.initialWeight,
        state.nutritionalGoal,
      )
    },
    hasHealthData(state) {
      return Boolean(state.healthData)
    },
    hasGoal(state) {
      return Boolean(state.nutritionalGoal)
    },
    hasRestrictionsConfirmed(state) {
      return state.restrictionsConfirmed
    },
    completionPercentage() {
      const completedSteps = [this.hasHealthData, this.hasGoal, this.hasRestrictionsConfirmed].filter(
        Boolean,
      ).length
      return Math.round((completedSteps / 3) * 100)
    },
    goalLabel(state) {
      const labels = {
        'bajar-peso': t('nutritionalGoal.loseWeight'),
        'mantener-peso': t('nutritionalGoal.maintainWeight'),
        'ganar-masa': t('nutritionalGoal.gainMass'),
      }
      return labels[state.nutritionalGoal?.value] ?? t('stores.patientProfile.noGoal')
    },
  },
  actions: {
    async ensurePatientProfile() {
      if (this.profile) return this.profile
      const identityStore = useIdentityAccessStore()
      const userId = identityStore.currentUser?.id
      if (!userId) throw new Error(t('auth.userRequired'))

      const createdProfile = await patientProfileApiService.create({
        userId,
        weightKg: null,
        heightCm: null,
        age: null,
        biologicalSex: null,
        activityLevel: null,
        systolicPressure: null,
        diastolicPressure: null,
        basalGlucose: null,
        bmi: null,
        nutritionalGoal: null,
        targetWeightKg: null,
        dietaryRestrictions: [],
        restrictionsConfirmed: false,
        isComplete: false,
        assignedNutritionistId: null,
      })
      this.profile = createdProfile
      this.healthData = createdProfile.healthData
      this.nutritionalGoal = createdProfile.nutritionalGoal
      this.dietaryRestrictions = createdProfile.dietaryRestrictions
      this.restrictionsConfirmed = createdProfile.restrictionsConfirmed
      return createdProfile
    },
    async fetchPatientProfile() {
      this.loading = true
      this.error = ''
      try {
        const fetchedProfile = await patientProfileApiService.fetchProfile()
        this.profile = fetchedProfile
        this.healthData = fetchedProfile?.healthData ?? null
        this.nutritionalGoal = fetchedProfile?.nutritionalGoal ?? null
        this.dietaryRestrictions = fetchedProfile?.dietaryRestrictions ?? []
        this.restrictionsConfirmed = fetchedProfile?.restrictionsConfirmed ?? false
        this.weightRecords = []
        this.checkProfileCompletion()
        return this.profile
      } catch {
        this.error = ''
        this.profile = null
        return null
      } finally {
        this.loading = false
      }
    },
    async saveHealthData(data) {
      this.loading = true
      this.error = ''
      this.savedRecently = false
      try {
        const healthData = new HealthData(data)
        const targetWeightKg = this.nutritionalGoal
          ? calculateTargetWeightByGoal(healthData.weightKg, this.nutritionalGoal)
          : null
        const healthPayload = {
          weightKg: healthData.weightKg,
          heightCm: healthData.heightCm,
          activityLevel: activityToApi[healthData.activityLevel.value],
          targetWeightKg,
          nutritionalObjective: this.nutritionalGoal ? goalToApi[this.nutritionalGoal?.value ?? this.nutritionalGoal] : null,
          age: healthData.age ?? null,
          biologicalSex: healthData.biologicalSex?.value ?? null,
          systolicPressure: healthData.bloodPressure?.systolic ?? null,
          diastolicPressure: healthData.bloodPressure?.diastolic ?? null,
          glucoseMgDl: healthData.glucoseMgDl ?? null,
        }
        const updatedProfile = await patientProfileApiService.updateHealthData(healthPayload)
        this.profile = updatedProfile
        this.healthData = updatedProfile.healthData
        this.nutritionalGoal = updatedProfile.nutritionalGoal
        this.dietaryRestrictions = updatedProfile.dietaryRestrictions
        this.restrictionsConfirmed = updatedProfile?.restrictionsConfirmed ?? false
        this.savedRecently = true
        this.checkProfileCompletion()
        await this.syncEligibleNutritionAccess()
        return this.healthData
      } catch (error) {
        this.error = t('stores.patientProfile.saveHealthData')
        throw error
      } finally {
        this.loading = false
      }
    },
    calculateBMI(weightKg = this.healthData?.weightKg, heightCm = this.healthData?.heightCm) {
      return calculateBMI(weightKg, heightCm)
    },
    getBMIStatus(bmiValue) {
      return getBMIStatus(bmiValue)
    },
    calculateTargetWeight(initialWeight, nutritionalGoal = this.nutritionalGoal) {
      return calculateTargetWeightByGoal(initialWeight, nutritionalGoal)
    },
    calculateWeightToGoal(
      currentWeight,
      targetWeight,
      nutritionalGoal = this.nutritionalGoal,
    ) {
      return calculateRemainingToGoal(currentWeight, targetWeight, nutritionalGoal)
    },
    getWeightGoalMessage(targetWeight, initialWeight, nutritionalGoal = this.nutritionalGoal) {
      return buildWeightGoalMessage(targetWeight, initialWeight, nutritionalGoal)
    },
    async saveNutritionalGoal(goal) {
      try {
        const updatedProfile = await patientProfileApiService.updateNutritionalGoal(goalToApi[goal])
        this.profile = updatedProfile
        this.nutritionalGoal = updatedProfile.nutritionalGoal
        this.savedRecently = true
        this.checkProfileCompletion()
        await this.syncEligibleNutritionAccess()
      } catch (error) {
        this.error = t('stores.patientProfile.saveGoal')
        throw error
      }
    },
    async saveDietaryRestrictions(restrictions) {
      if (!this.profile) await this.fetchPatientProfile()
      if (!this.profile) await this.ensurePatientProfile()
      const normalizedRestrictions = restrictions.includes(t('dietaryRestrictions.noRestrictions')) ? [] : restrictions
      const updatedProfile = await patientProfileApiService.updateRestrictions(normalizedRestrictions)
      this.profile = updatedProfile
      this.dietaryRestrictions = updatedProfile.dietaryRestrictions
      this.restrictionsConfirmed = true
      this.profile.restrictionsConfirmed = true
      this.savedRecently = true
      this.checkProfileCompletion()
      await this.syncEligibleNutritionAccess()
    },
    markProfileComplete() {
      if (!this.profile) return
      this.isProfileComplete = true
      this.profileCompletionEvent = this.profile.markCompletedEvent()
    },
    checkProfileCompletion() {
      this.isProfileComplete = Boolean(
        this.hasHealthData && this.hasGoal && this.hasRestrictionsConfirmed,
      )
      if (this.isProfileComplete) this.markProfileComplete()
      return this.isProfileComplete
    },
    async syncEligibleNutritionAccess() {
      if (!this.isProfileComplete) return null
      const identityStore = useIdentityAccessStore()
      if (!identityStore.hasVerifiedAccount || !identityStore.currentUser?.id) return null
      try {
        return await syncNutritionAccessForUser(identityStore.currentUser.id)
      } catch {
        return null
      }
    },
    getRecommendedCalories() {
      const calorieByGoal = {
        'bajar-peso': 1800,
        'mantener-peso': 2200,
        'ganar-masa': 2500,
      }
      return calorieByGoal[this.nutritionalGoal?.value] ?? 2180
    },
    async ensureInitialWeightRecord(profile) {
      const patientId = profile?.id
      const weightKg = profile?.healthData?.weightKg
      if (!patientId || !weightKg) return null

      const records = await patientProgressApiService.fetchRawWeightRecords(patientId)
      const initialRecord = records.find((record) => record.type === 'INITIAL')
      const progressRecords = records.filter((record) => record.type !== 'INITIAL')
      const payload = {
        patientId,
        date: profile.createdAt?.toISOString?.().slice(0, 10) ?? new Date().toISOString().slice(0, 10),
        weightKg,
        type: 'INITIAL',
        source: 'HEALTH_PROFILE',
        comment: t('stores.patientProfile.initialWeightComment'),
      }

      if (!initialRecord) return patientProgressApiService.createWeightRecord(payload)
      if (!progressRecords.length) {
        return patientProgressApiService.updateWeightRecord(initialRecord.id, payload)
      }
      return initialRecord
    },
    resetProfileMock() {
      this.profile = null
      this.healthData = null
      this.nutritionalGoal = null
      this.dietaryRestrictions = []
      this.weightRecords = []
      this.restrictionsConfirmed = false
      this.isProfileComplete = false
      this.profileCompletionEvent = null
      this.savedRecently = false
      this.error = ''
    },
  },
})
