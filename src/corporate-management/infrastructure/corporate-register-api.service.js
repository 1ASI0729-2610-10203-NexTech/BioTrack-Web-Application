import { apiService } from '../../shared/infrastructure/api.service'

export const corporateRegisterApiService = {
    async registerCompany(data) {
        return apiService.post('/companies', {
            adminUserId: 3,
            name: data.name,
            ruc: data.ruc,
            status: 'PENDING',
        })
    },
}