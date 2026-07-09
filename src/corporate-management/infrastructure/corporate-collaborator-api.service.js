import { apiService } from '../../shared/infrastructure/api.service'

export const corporateCollaboratorApiService = {
  async uploadCollaborators(companyId, collaborators) {
    return apiService.post(`/companies/${companyId}/collaborators/upload`, { collaborators })
  },
}
