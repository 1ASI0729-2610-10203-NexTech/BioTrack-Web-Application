import { CorporateMetric } from '../domain/model/corporate-management.entity'

export const CorporateMetricAssembler = {
  fromApi(payload) {
    return new CorporateMetric({
      id: payload.id,
      companyId: payload.companyId,
      sampleSize: payload.activeCollaborators,
      threshold: 10,
      averages: {
        adherence: payload.averageAdherence,
        bmi: payload.averageBmi,
      },
    })
  },
}
