import { apiService } from '../../shared/infrastructure/api.service'

export const corporateCollaboratorApiService = {
  async fetchCollaborators(_companyId) {
    return []
  },

  async uploadCollaborators(companyId, collaborators) {
    return apiService.put(`/companies/${companyId}/collaborators`, { collaborators })
  },
}
