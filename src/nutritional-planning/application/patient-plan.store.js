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
  },
  actions: {
    async fetchPatientPlan() {
      this.loading = true
      this.error = ''
      const identityStore = useIdentityAccessStore()
      const response = await patientPlanApiService.fetchCurrentPlan(identityStore.currentUser?.id ?? 1)
      this.currentPlan = response?.entity ?? null
      this.currentPlanId = response?.raw?.id ?? null
      this.planStatus = response?.raw?.status ?? PatientPlanStatus.NONE
      this.nutritionist = response?.entity?.nutritionist ?? ''
      this.weeklyDiet = this.currentPlanId
        ? await patientPlanApiService.fetchWeeklyDiet(this.currentPlanId)
        : null
      this.loading = false
      return this.currentPlan
    },
    async acceptPlan() {
      this.loading = true
      await this.fetchPatientPlan()
      const updatedPlan = await patientPlanApiService.acceptPlan(this.currentPlanId)
      this.planStatus = updatedPlan.status
      this.currentPlan = new PatientPlan({
        ...this.currentPlan,
        status: updatedPlan.status,
      })
      this.acceptedRecently = true
      this.loading = false
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
