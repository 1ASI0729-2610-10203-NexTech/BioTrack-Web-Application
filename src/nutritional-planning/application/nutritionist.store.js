import { defineStore } from 'pinia'
import { useIdentityAccessStore } from '../../identity-access/application/identity-access.store'
import { nutritionalPlanningApiService } from '../infrastructure/nutritional-planning-api.service'

function getAuthenticatedUserId() {
  const identityAccessStore = useIdentityAccessStore()
  const userId = identityAccessStore.currentUser?.id
  if (!userId) throw new Error('No existe un usuario autenticado.')
  return userId
}

function validateMacroDistribution({ proteinPercentage, carbohydratePercentage, fatPercentage }) {
  const total =
    Number(proteinPercentage || 0) +
    Number(carbohydratePercentage || 0) +
    Number(fatPercentage || 0)
  return total === 100
}

export const useNutritionistStore = defineStore('nutritionist', {
  state: () => ({
    nutritionist: null,
    assignedPatients: [],
    selectedPatient: null,
    evaluations: [],
    plans: [],
    followUpNotes: [],
    loading: false,
    error: '',
    savedRecently: false,
  }),
  getters: {
    totalAssignedPatients(state) {
      return state.assignedPatients.length
    },
    completeProfilesCount(state) {
      return state.assignedPatients.filter((patient) => patient.isComplete).length
    },
    activePlansCount(state) {
      return state.assignedPatients.filter((patient) => patient.planStatus === 'ACTIVATED').length
    },
    pendingEvaluationCount(state) {
      return state.assignedPatients.filter((patient) => !patient.evaluations?.length).length
    },
    lowAdherenceCount(state) {
      return state.assignedPatients.filter((patient) => patient.adherence.percentage < 60).length
    },
    recentPatients(state) {
      return [...state.assignedPatients].slice(0, 4)
    },
  },
  actions: {
    async fetchAssignedPatients() {
      this.loading = true
      this.error = ''
      try {
        const userId = getAuthenticatedUserId()
        const { nutritionist, patients } =
          await nutritionalPlanningApiService.fetchAssignedPatients(userId)
        this.nutritionist = nutritionist
        this.assignedPatients = patients
        this.plans = patients.map((patient) => patient.plan).filter(Boolean)
        return patients
      } catch (error) {
        this.error = error.message || 'No se pudieron cargar los pacientes asignados.'
        throw error
      } finally {
        this.loading = false
      }
    },
    async fetchPatientDetail(patientId) {
      this.loading = true
      this.error = ''
      try {
        const userId = getAuthenticatedUserId()
        const { nutritionist, patient } =
          await nutritionalPlanningApiService.fetchAssignedPatientDetail(userId, patientId)
        this.nutritionist = nutritionist
        this.selectedPatient = patient
        this.evaluations = patient.evaluations
        this.followUpNotes = patient.followUpNotes
        return patient
      } catch (error) {
        this.error = error.message || 'No se pudo cargar el detalle del paciente.'
        throw error
      } finally {
        this.loading = false
      }
    },
    async createEvaluation(patientId, payload) {
      this.loading = true
      this.error = ''
      this.savedRecently = false
      try {
        if (!payload.observations?.trim()) {
          throw new Error('Las observaciones clínicas son obligatorias.')
        }
        if (!payload.targetCalories || Number(payload.targetCalories) <= 0) {
          throw new Error('Las calorías objetivo son obligatorias.')
        }
        if (!validateMacroDistribution(payload)) {
          throw new Error('La suma de proteínas, carbohidratos y grasas debe ser 100%.')
        }
        const userId = getAuthenticatedUserId()
        const evaluation = await nutritionalPlanningApiService.createEvaluation(
          userId,
          patientId,
          payload,
        )
        this.evaluations = [...this.evaluations, evaluation]
        this.savedRecently = true
        return evaluation
      } catch (error) {
        this.error = error.message || 'No se pudo crear la evaluación.'
        throw error
      } finally {
        this.loading = false
      }
    },
    async createPlan(patientId, payload) {
      this.loading = true
      this.error = ''
      this.savedRecently = false
      try {
        if (!payload.name?.trim()) throw new Error('El nombre del plan es obligatorio.')
        if (!payload.dailyCalories || Number(payload.dailyCalories) <= 0) {
          throw new Error('Las calorías diarias son obligatorias.')
        }
        if (!validateMacroDistribution(payload)) {
          throw new Error('La suma de proteínas, carbohidratos y grasas debe ser 100%.')
        }
        const userId = getAuthenticatedUserId()
        const result = await nutritionalPlanningApiService.createPlan(userId, patientId, payload)
        this.plans = [...this.plans, result.plan]
        this.savedRecently = true
        await this.fetchPatientDetail(patientId)
        return result
      } catch (error) {
        this.error = error.message || 'No se pudo crear el plan nutricional.'
        throw error
      } finally {
        this.loading = false
      }
    },
    async updatePlanStatus(patientId, planId, status) {
      this.loading = true
      this.error = ''
      try {
        const userId = getAuthenticatedUserId()
        const updatedPlan = await nutritionalPlanningApiService.updatePlanStatus(
          userId,
          patientId,
          planId,
          status,
        )
        await this.fetchPatientDetail(patientId)
        await this.fetchAssignedPatients()
        return updatedPlan
      } catch (error) {
        this.error = error.message || 'No se pudo actualizar el estado del plan.'
        throw error
      } finally {
        this.loading = false
      }
    },
    async fetchPatientProgress(patientId) {
      return this.fetchPatientDetail(patientId)
    },
    async saveFollowUpNote(patientId, note) {
      this.loading = true
      this.error = ''
      this.savedRecently = false
      try {
        if (!note?.trim()) throw new Error('La nota de seguimiento es obligatoria.')
        const userId = getAuthenticatedUserId()
        const savedNote = await nutritionalPlanningApiService.saveFollowUpNote(
          userId,
          patientId,
          note,
        )
        this.followUpNotes = [...this.followUpNotes, savedNote]
        this.savedRecently = true
        return savedNote
      } catch (error) {
        this.error = error.message || 'No se pudo registrar la nota.'
        throw error
      } finally {
        this.loading = false
      }
    },
    resetNutritionistState() {
      this.nutritionist = null
      this.assignedPatients = []
      this.selectedPatient = null
      this.evaluations = []
      this.plans = []
      this.followUpNotes = []
      this.error = ''
      this.savedRecently = false
    },
  },
})
