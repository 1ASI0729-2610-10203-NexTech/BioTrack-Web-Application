import { CorporateMetric } from '../domain/model/corporate-management.entity'

export const CorporateMetricAssembler = {
  fromApi(payload) {
    return new CorporateMetric({
      companyId: payload.companyId,
      companyName: payload.companyName,
      totalCollaborators: payload.totalCollaborators,
      activeCollaborators: payload.activeCollaborators,
      inactiveCollaborators: payload.inactiveCollaborators,
      pendingCollaborators: payload.pendingCollaborators,
      lastUpdated: payload.lastUpdated,
    })
  },
}
