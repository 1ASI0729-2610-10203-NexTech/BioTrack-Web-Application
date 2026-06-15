import { apiService } from '../../shared/infrastructure/api.service'

export const corporateCollaboratorApiService = {
    async fetchCollaborators(companyId = 1) {
        return apiService.get(`/companies/${companyId}/collaborators`)
    },

    async uploadCollaborators(companyId = 1, file) {
        const formData = new FormData()
        formData.append('file', file)
        return apiService.post(`/companies/${companyId}/collaborators/upload`, formData)
    },
}