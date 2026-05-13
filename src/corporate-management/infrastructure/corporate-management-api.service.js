import { apiService } from '../../shared/infrastructure/api.service'
import { CorporateMetricAssembler } from './corporate-metric.assembler'

export const corporateManagementApiService = {
  async fetchMetrics() {
    const payload = await apiService.get('/corporate-management/metrics')
    return payload.items.map(CorporateMetricAssembler.fromApi)
  },
}
