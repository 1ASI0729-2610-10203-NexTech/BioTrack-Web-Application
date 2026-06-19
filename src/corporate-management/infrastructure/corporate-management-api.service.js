import { apiService } from '../../shared/infrastructure/api.service'
import { CorporateMetricAssembler } from './corporate-metric.assembler'

export const corporateManagementApiService = {
  async fetchMetrics(companyId) {
    const payload = await apiService.get(`/companies/${companyId}/metrics`)
    return payload ? CorporateMetricAssembler.fromApi(payload) : null
  },
}
