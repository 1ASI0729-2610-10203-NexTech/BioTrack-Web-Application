import { apiService } from '../../shared/infrastructure/api.service'
import { CorporateMetricAssembler } from './corporate-metric.assembler'

export const corporateManagementApiService = {
  async fetchMetrics(companyId = 1) {
    const payload = await apiService.get(`/companies/${companyId}/metrics`)
    const data = Array.isArray(payload) ? payload : [payload]
    return data.map(CorporateMetricAssembler.fromApi)
  },
}
