import { defineStore } from 'pinia'
import { PatientPlan } from '../domain/model/patient-plan.entity'
import { PatientPlanStatus } from '../domain/model/plan-status.value-object'
import { useIdentityAccessStore } from '../../identity-access/application/identity-access.store'
import { patientPlanApiService } from '../infrastructure/patient-plan-api.service'

export const usePatientPlanStore = defineStore('patient-plan', {
  state: () => ({
    currentPlan: null,
    currentPlanId: null,
    planStatus: PatientPlanStatus.NONE,
    weeklyDiet: null,
    nutritionist: '',
    loading: false,
    error: '',
    acceptedRecently: false,
  }),
  getters: {
    hasActivePlan(state) {
      return state.planStatus === PatientPlanStatus.ACTIVE
    },
    hasProposedPlan(state) {
      return state.planStatus === PatientPlanStatus.PROPOSED
    },
    hasRejectedPlan(state) {
      return state.planStatus === PatientPlanStatus.REJECTED
    },
  },
  actions: {
    async fetchPatientPlan() {
      this.loading = true
      this.error = ''
      try {
        const identityStore = useIdentityAccessStore()
        const response = await patientPlanApiService.fetchCurrentPlan(identityStore.currentUser?.id ?? 1)
        this.currentPlan = response?.entity ?? null
        this.currentPlanId = response?.raw?.id ?? null
        this.planStatus = response?.raw?.status ?? PatientPlanStatus.NONE
        this.nutritionist = response?.entity?.nutritionist ?? ''
        this.weeklyDiet = this.currentPlanId
          ? await patientPlanApiService.fetchWeeklyDiet(this.currentPlanId)
          : null
        return this.currentPlan
      } catch (error) {
        this.error = 'No se pudo cargar el plan nutricional.'
        throw error
      } finally {
        this.loading = false
      }
    },
    async acceptPlan() {
      this.loading = true
      this.error = ''
      try {
        if (!this.currentPlanId) await this.fetchPatientPlan()
        if (!this.currentPlanId) throw new Error('Patient plan not found')
        const updatedPlan = await patientPlanApiService.acceptPlan(this.currentPlanId)
        this.planStatus = updatedPlan.status
        this.currentPlan = new PatientPlan({
          ...this.currentPlan,
          status: updatedPlan.status,
        })
        this.acceptedRecently = true
      } catch (error) {
        this.error = 'No se pudo aceptar el plan.'
        throw error
      } finally {
        this.loading = false
      }
    },
    async rejectPlan(reason = 'Rechazado por el paciente') {
      await this.fetchPatientPlan()
      const updatedPlan = await patientPlanApiService.rejectPlan(this.currentPlanId, reason)
      this.planStatus = updatedPlan.status
      this.currentPlan = new PatientPlan({
        ...this.currentPlan,
        status: updatedPlan.status,
      })
    },
    async getWeeklyDiet() {
      if (!this.weeklyDiet && this.currentPlanId) {
        this.weeklyDiet = await patientPlanApiService.fetchWeeklyDiet(this.currentPlanId)
      }
      return this.weeklyDiet
    },
    resetPlanAcceptance() {
      this.acceptedRecently = false
    },
  },
})
