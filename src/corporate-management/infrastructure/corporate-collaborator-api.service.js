import { apiService } from '../../shared/infrastructure/api.service'

export const corporateCollaboratorApiService = {
  // No GET collaborators endpoint in backend
  async fetchCollaborators(_companyId = 1) {
    return []
  },

  // PUT /api/v1/companies/{companyId}/collaborators
  async uploadCollaborators(companyId = 1, file) {
    const formData = new FormData()
    formData.append('file', file)
    return apiService.put(`/companies/${companyId}/collaborators`, formData)
  },
}