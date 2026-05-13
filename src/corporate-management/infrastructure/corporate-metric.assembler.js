import { CorporateMetric } from '../domain/model/corporate-management.entity'

export const CorporateMetricAssembler = {
  fromApi(payload) {
    return new CorporateMetric({
      id: payload.id,
      companyId: payload.company_id,
      sampleSize: payload.sample_size,
      threshold: payload.threshold,
      averages: payload.averages,
    })
  },
}
