import { apiService } from '../../shared/infrastructure/api.service'
import { NutritionalPlanAssembler } from './nutritional-plan.assembler'

export const nutritionalPlanningApiService = {
  async fetchCurrentPlan() {
    const payload = await apiService.get('/nutritional-planning/current-plan')
    return NutritionalPlanAssembler.fromApi(payload)
  },
}
