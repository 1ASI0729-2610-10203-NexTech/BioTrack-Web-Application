import { defineStore } from 'pinia'
import { patientProfileApiService } from '../infrastructure/patient-profile-api.service'

export const usePatientProfileStore = defineStore('patient-profile', {
  state: () => ({
    profile: null,
    domainEvents: [],
  }),
  actions: {
    async loadProfile() {
      this.profile = await patientProfileApiService.fetchCurrent()
      const event = this.profile.markCompletedEvent()
      if (event) this.domainEvents.push(event)
    },
  },
})
