import { defineStore } from 'pinia'
import { HealthData } from '../domain/model/health-data.value-object'
import { calculateBMI } from '../domain/model/bmi.value-object'
import { useIdentityAccessStore } from '../../identity-access/application/identity-access.store'
import { patientProgressApiService } from '../../progress-tracking/infrastructure/patient-progress-api.service'
import { calculateTargetWeightByGoal } from '../../progress-tracking/domain/model/weight-progress.helpers'
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
      try {
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
        return this.profile
      } catch (error) {
        this.error = 'No se pudo cargar el perfil del paciente.'
        throw error
      } finally {
        this.loading = false
      }
    },
    async saveHealthData(data) {
      this.loading = true
      this.error = ''
      this.savedRecently = false
      try {
        const identityStore = useIdentityAccessStore()
        if (!this.profile) {
          await this.fetchPatientProfile()
          this.loading = true
        }

        const healthData = new HealthData(data)
        const willBeComplete = Boolean(this.nutritionalGoal && this.restrictionsConfirmed)
        const targetWeightKg =
          this.profile?.targetWeightKg ??
          (this.nutritionalGoal
            ? calculateTargetWeightByGoal(healthData.weightKg, this.nutritionalGoal)
            : null)
        const healthPayload = {
          weightKg: healthData.weightKg,
          heightCm: healthData.heightCm,
          age: healthData.age,
          biologicalSex: sexToApi[healthData.biologicalSex.value],
          activityLevel: activityToApi[healthData.activityLevel.value],
          systolicPressure: healthData.bloodPressure.systolic,
          diastolicPressure: healthData.bloodPressure.diastolic,
          basalGlucose: healthData.glucoseMgDl,
          bmi: Number(healthData.bmi.value.toFixed(2)),
          targetWeightKg,
          isComplete: willBeComplete,
          updatedAt: new Date().toISOString(),
        }
        const updatedProfile = this.profile?.id
          ? await patientProfileApiService.updateHealthData(this.profile.id, healthPayload)
          : await patientProfileApiService.create({
              userId: identityStore.currentUser?.id ?? 1,
              ...healthPayload,
              nutritionalGoal: this.nutritionalGoal ? goalToApi[this.nutritionalGoal.value] : null,
              dietaryRestrictions: this.dietaryRestrictions.map((restriction) => restriction.label),
              restrictionsConfirmed: this.restrictionsConfirmed,
              assignedNutritionistId: null,
            })

        this.profile = updatedProfile
        this.healthData = updatedProfile.healthData
        this.nutritionalGoal = updatedProfile.nutritionalGoal
        this.dietaryRestrictions = updatedProfile.dietaryRestrictions
        this.restrictionsConfirmed = updatedProfile.restrictionsConfirmed
        this.savedRecently = true
        await this.ensureInitialWeightRecord(updatedProfile)
        this.checkProfileCompletion()
        return this.healthData
      } catch (error) {
        this.error = 'No se pudieron guardar los datos'
        throw error
      } finally {
        this.loading = false
      }
    },
    calculateBMI(weightKg = this.healthData?.weightKg, heightCm = this.healthData?.heightCm) {
      return calculateBMI(weightKg, heightCm)
    },
    async saveNutritionalGoal(goal) {
      if (!this.profile) await this.fetchPatientProfile()
      const initialWeight = this.healthData?.weightKg
      const targetWeightKg = initialWeight ? calculateTargetWeightByGoal(initialWeight, goal) : null
      const updatedProfile = await patientProfileApiService.update(this.profile.id, {
        nutritionalGoal: goalToApi[goal],
        targetWeightKg,
        isComplete: Boolean(this.healthData && this.restrictionsConfirmed),
        updatedAt: new Date().toISOString(),
      })
      this.profile = updatedProfile
      this.nutritionalGoal = updatedProfile.nutritionalGoal
      this.savedRecently = true
      this.checkProfileCompletion()
    },
    async saveDietaryRestrictions(restrictions) {
      if (!this.profile) await this.fetchPatientProfile()
      const normalizedRestrictions = restrictions.includes('Sin restricciones') ? [] : restrictions
      const updatedProfile = await patientProfileApiService.update(this.profile.id, {
        dietaryRestrictions: normalizedRestrictions,
        restrictionsConfirmed: true,
        isComplete: Boolean(this.healthData && this.nutritionalGoal),
        updatedAt: new Date().toISOString(),
      })
      this.profile = updatedProfile
      this.dietaryRestrictions = updatedProfile.dietaryRestrictions
      this.restrictionsConfirmed = true
      this.profile.restrictionsConfirmed = true
      this.savedRecently = true
      this.checkProfileCompletion()
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
        comment: 'Peso inicial registrado desde perfil de salud',
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
      this.restrictionsConfirmed = false
      this.isProfileComplete = false
      this.profileCompletionEvent = null
      this.savedRecently = false
      this.error = ''
    },
  },
})
