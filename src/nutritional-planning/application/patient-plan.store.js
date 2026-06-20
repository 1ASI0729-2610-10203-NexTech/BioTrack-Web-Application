import { defineStore } from 'pinia'
import { PatientPlan } from '../domain/model/patient-plan.entity'
import { PatientPlanStatus } from '../domain/model/plan-status.value-object'
import { useIdentityAccessStore } from '../../identity-access/application/identity-access.store'
import { usePatientProfileStore } from '../../patient-profile/application/patient-profile.store'
import { syncNutritionAccessForUser } from '../../subscriptions-billing/application/subscription-nutrition-access.service'
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
        const patientProfileStore = usePatientProfileStore()
        const userId = identityStore.currentUser?.id
        if (!userId) {
          this.planStatus = PatientPlanStatus.NONE
          return null
        }
        if (!patientProfileStore.profile) {
          await patientProfileStore.fetchPatientProfile()
        }
        if (!identityStore.hasVerifiedAccount || !patientProfileStore.isProfileComplete) {
          this.currentPlan = null
          this.currentPlanId = null
          this.planStatus = PatientPlanStatus.NONE
          this.weeklyDiet = null
          this.nutritionist = ''
          return null
        }
        await syncNutritionAccessForUser(userId)
        const plans = await patientPlanApiService.fetchPlans()
        const activePlan = plans.find((p) => p.status === PatientPlanStatus.ACTIVE) ?? null
        this.currentPlan = activePlan
        this.currentPlanId = activePlan?.id ?? null
        this.planStatus = activePlan?.status ?? PatientPlanStatus.NONE
        this.nutritionist = ''
        this.weeklyDiet = this.currentPlanId
          ? await patientPlanApiService.fetchWeeklyDiet(this.currentPlanId)
          : null
        return this.currentPlan
      } catch (error) {
        this.error = 'No se pudo cargar el plan nutricional.'
        this.currentPlan = null
        this.planStatus = PatientPlanStatus.NONE
        return null
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
