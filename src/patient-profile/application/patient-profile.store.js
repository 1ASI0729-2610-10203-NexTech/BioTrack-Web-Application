import { defineStore } from 'pinia'
import { HealthData } from '../domain/model/health-data.value-object'
import { calculateBMI } from '../domain/model/bmi.value-object'
import { useIdentityAccessStore } from '../../identity-access/application/identity-access.store'
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
    isProfileComplete: false,
    profileCompletionEvent: null,
    restrictionsConfirmed: false,
    loading: false,
    error: '',
    savedRecently: false,
  }),
  getters: {
    bmiValue(state) {
      return state.healthData?.bmi?.value ?? 0
    },
    bmiStatus() {
      const value = this.bmiValue
      if (value < 18.5) return 'Bajo peso'
      if (value < 25) return 'Normal'
      if (value < 30) return 'Sobrepeso'
      return 'Obesidad'
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
        'bajar-peso': 'Bajar de peso',
        'mantener-peso': 'Mantener peso',
        'ganar-masa': 'Ganar masa muscular',
      }
      return labels[state.nutritionalGoal?.value] ?? 'Sin objetivo'
    },
  },
  actions: {
    async fetchPatientProfile() {
      this.loading = true
      this.error = ''
      const identityStore = useIdentityAccessStore()
      const fetchedProfile = await patientProfileApiService.fetchByUserId(
        identityStore.currentUser?.id ?? 1,
      )
      this.profile = fetchedProfile
      this.healthData = fetchedProfile?.healthData ?? null
      this.nutritionalGoal = fetchedProfile?.nutritionalGoal ?? null
      this.dietaryRestrictions = fetchedProfile?.dietaryRestrictions ?? []
      this.restrictionsConfirmed = fetchedProfile?.restrictionsConfirmed ?? false
      this.checkProfileCompletion()
      this.loading = false
      return this.profile
    },
    async saveHealthData(data) {
      this.loading = true
      this.error = ''
      const healthData = new HealthData(data)
      const updatedProfile = await patientProfileApiService.update(this.profile.id, {
        weightKg: healthData.weightKg,
        heightCm: healthData.heightCm,
        age: healthData.age,
        biologicalSex: sexToApi[healthData.biologicalSex.value],
        activityLevel: activityToApi[healthData.activityLevel.value],
        systolicPressure: healthData.bloodPressure.systolic,
        diastolicPressure: healthData.bloodPressure.diastolic,
        basalGlucose: healthData.glucoseMgDl,
        bmi: Number(healthData.bmi.value.toFixed(2)),
      })
      this.profile = updatedProfile
      this.healthData = updatedProfile.healthData
      this.savedRecently = true
      this.loading = false
      this.checkProfileCompletion()
      return this.healthData
    },
    calculateBMI(weightKg = this.healthData?.weightKg, heightCm = this.healthData?.heightCm) {
      return calculateBMI(weightKg, heightCm)
    },
    async saveNutritionalGoal(goal) {
      const updatedProfile = await patientProfileApiService.update(this.profile.id, {
        nutritionalGoal: goalToApi[goal],
      })
      this.profile = updatedProfile
      this.nutritionalGoal = updatedProfile.nutritionalGoal
      this.savedRecently = true
      this.checkProfileCompletion()
    },
    async saveDietaryRestrictions(restrictions) {
      const normalizedRestrictions = restrictions.includes('Sin restricciones') ? [] : restrictions
      const updatedProfile = await patientProfileApiService.update(this.profile.id, {
        dietaryRestrictions: normalizedRestrictions,
        restrictionsConfirmed: true,
      })
      this.profile = updatedProfile
      this.dietaryRestrictions = updatedProfile.dietaryRestrictions
      this.restrictionsConfirmed = true
      this.profile.restrictionsConfirmed = true
      this.savedRecently = true
      this.checkProfileCompletion()
    },
    markProfileComplete() {
      this.isProfileComplete = true
      this.profileCompletionEvent = this.profile.markCompletedEvent()
      patientProfileApiService.update(this.profile.id, { isComplete: true })
    },
    checkProfileCompletion() {
      this.isProfileComplete = Boolean(
        this.hasHealthData && this.hasGoal && this.hasRestrictionsConfirmed,
      )
      if (this.isProfileComplete) this.markProfileComplete()
      return this.isProfileComplete
    },
    getRecommendedCalories() {
      const calorieByGoal = {
        'bajar-peso': 1800,
        'mantener-peso': 2200,
        'ganar-masa': 2500,
      }
      return calorieByGoal[this.nutritionalGoal?.value] ?? 2180
    },
    resetProfileMock() {
      this.profile = null
      this.healthData = null
      this.nutritionalGoal = null
      this.dietaryRestrictions = []
      this.restrictionsConfirmed = false
      this.isProfileComplete = false
      this.profileCompletionEvent = null
      this.savedRecently = false
      this.error = ''
    },
  },
})
