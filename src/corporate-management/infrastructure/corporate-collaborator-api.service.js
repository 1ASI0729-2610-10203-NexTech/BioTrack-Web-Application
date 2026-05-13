import { apiService } from '../../shared/infrastructure/api.service'

export const corporateCollaboratorApiService = {
    async fetchCollaborators(companyId = 1) {
        const payload = await apiService.get('/collaborators')
        return payload.filter((c) => c.companyId === companyId)
    },

    async sendInvitations(companyId = 1) {
        const collaborators = await this.fetchCollaborators(companyId)
        const toInvite = collaborators.filter((c) => c.status !== 'ACTIVE')
        const updates = toInvite.map((c) =>
            apiService.patch(`/collaborators/${c.id}`, { status: 'INVITED', sentAt: new Date().toISOString() })
        )
        await Promise.all(updates)
        return this.fetchCollaborators(companyId)
    },
}