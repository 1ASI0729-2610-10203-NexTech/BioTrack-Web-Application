import { defineStore } from 'pinia'
import { progressTrackingApiService } from '../infrastructure/progress-tracking-api.service'
import { AdherenceAlert } from '../domain/model/progress-tracking.entity'

export const useProgressTrackingStore = defineStore('progress-tracking', {
  state: () => ({
    adherence: null,
    report: null,
    alerts: [],
  }),
  actions: {
    async loadSummary() {
      const summary = await progressTrackingApiService.fetchSummary()
      this.adherence = summary.adherence
      this.report = summary.report
    },
    generateLowAdherenceAlert(reportPeriod) {
      if (!this.adherence || this.adherence.percentage.value >= 60) return null
      const alert = AdherenceAlert.createOnce({
        patientId: this.adherence.patientId,
        reportPeriod,
        existingAlerts: this.alerts,
      })
      if (alert) this.alerts.push(alert)
      return alert
    },
  },
})
