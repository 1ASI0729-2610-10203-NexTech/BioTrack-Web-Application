import { apiService } from '../../shared/infrastructure/api.service'

export const corporateRegisterApiService = {
  async registerCompany(data) {
    return apiService.post('/companies', {
      name: data.name,
      ruc: data.ruc,
      sector: data.sector,
      country: data.country,
      city: data.city,
    })
  },
}
