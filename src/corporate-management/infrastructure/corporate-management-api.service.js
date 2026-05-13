import { apiService } from '../../shared/infrastructure/api.service'
import { CorporateMetricAssembler } from './corporate-metric.assembler'

export const corporateManagementApiService = {
  async fetchMetrics(companyId = 1) {
    const payload = await apiService.get('/corporate-metrics')
    return payload
      .filter((metric) => metric.companyId === companyId)
      .map(CorporateMetricAssembler.fromApi)
  },
}
