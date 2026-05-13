import { defineStore } from 'pinia'
import { PatientProfile } from '../domain/model/patient-profile.entity'
import { HealthData } from '../domain/model/health-data.value-object'
import { NutritionalGoal } from '../domain/model/nutritional-goal.value-object'
import { DietaryRestriction } from '../domain/model/dietary-restriction.entity'
import { calculateBMI } from '../domain/model/bmi.value-object'

function createMockHealthData() {
  return new HealthData({
    weightKg: 78,
    heightCm: 175,
    age: 32,
    biologicalSex: 'masculino',
    activityLevel: 'moderada',
    systolic: 120,
    diastolic: 80,
    glucoseMgDl: 90,
  })
}

function createMockProfile() {
  return new PatientProfile({
    patientId: 'patient-juan-perez',
    firstName: 'Juan',
    lastName: 'Perez',
    healthData: createMockHealthData(),
    nutritionalGoal: new NutritionalGoal('bajar-peso'),
    dietaryRestrictions: [new DietaryRestriction({ label: 'Sin restricciones' })],
    restrictionsConfirmed: true,
    nutritionist: 'Dra. Ana Torres',
  })
}

export const usePatientProfileStore = defineStore('patient-profile', {
  state: () => ({
    profile: createMockProfile(),
    healthData: createMockHealthData(),
    nutritionalGoal: new NutritionalGoal('bajar-peso'),
    dietaryRestrictions: [new DietaryRestriction({ label: 'Sin restricciones' })],
    isProfileComplete: true,
    profileCompletionEvent: {
      type: 'PerfilPacienteCompleto',
      patientId: 'patient-juan-perez',
      occurredAt: new Date(),
    },
    restrictionsConfirmed: true,
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
      return this.profile
    },
    async saveHealthData(data) {
      this.loading = true
      this.error = ''
      await new Promise((resolve) => setTimeout(resolve, 350))
      this.healthData = new HealthData(data)
      this.profile.healthData = this.healthData
      this.savedRecently = true
      this.loading = false
      this.checkProfileCompletion()
      return this.healthData
    },
    calculateBMI(weightKg = this.healthData.weightKg, heightCm = this.healthData.heightCm) {
      return calculateBMI(weightKg, heightCm)
    },
    async saveNutritionalGoal(goal) {
      this.nutritionalGoal = new NutritionalGoal(goal)
      this.profile.nutritionalGoal = this.nutritionalGoal
      this.savedRecently = true
      this.checkProfileCompletion()
    },
    async saveDietaryRestrictions(restrictions) {
      this.dietaryRestrictions = restrictions.map(
        (restriction) => new DietaryRestriction({ label: restriction }),
      )
      this.profile.dietaryRestrictions = this.dietaryRestrictions
      this.restrictionsConfirmed = true
      this.profile.restrictionsConfirmed = true
      this.savedRecently = true
      this.checkProfileCompletion()
    },
    markProfileComplete() {
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
    resetProfileMock() {
      this.profile = createMockProfile()
      this.healthData = createMockHealthData()
      this.nutritionalGoal = new NutritionalGoal('bajar-peso')
      this.dietaryRestrictions = [new DietaryRestriction({ label: 'Sin restricciones' })]
      this.restrictionsConfirmed = true
      this.isProfileComplete = true
      this.profileCompletionEvent = this.profile.markCompletedEvent()
      this.savedRecently = false
      this.error = ''
    },
  },
})
