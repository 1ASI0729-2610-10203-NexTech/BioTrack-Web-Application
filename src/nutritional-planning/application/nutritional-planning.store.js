import { defineStore } from 'pinia'
import { nutritionalPlanningApiService } from '../infrastructure/nutritional-planning-api.service'

export const useNutritionalPlanningStore = defineStore('nutritional-planning', {
  state: () => ({ currentPlan: null }),
  actions: {
    async loadCurrentPlan() {
      this.currentPlan = await nutritionalPlanningApiService.fetchCurrentPlan()
    },
  },
})
