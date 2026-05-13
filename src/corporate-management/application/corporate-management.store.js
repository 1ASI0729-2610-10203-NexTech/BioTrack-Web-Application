import { defineStore } from 'pinia'
import { corporateManagementApiService } from '../infrastructure/corporate-management-api.service'

export const useCorporateManagementStore = defineStore('corporate-management', {
  state: () => ({ metrics: [] }),
  getters: {
    publishableMetrics(state) {
      return state.metrics.filter((metric) => metric.canBePublished()).map((metric) => metric.toAdminView())
    },
  },
  actions: {
    async loadMetrics() {
      this.metrics = await corporateManagementApiService.fetchMetrics()
    },
  },
})
