import { apiService } from '../../shared/infrastructure/api.service'
import { PatientProfileAssembler } from './patient-profile.assembler'

export const patientProfileApiService = {
  // GET /api/v1/profile
  async fetchByUserId(_userId) {
    const payload = await apiService.get('/profile')
    return payload ? PatientProfileAssembler.fromApi(payload) : null
  },

  // PUT /api/v1/profile/health-data
  async create(_userId, payload) {
    const created = await apiService.put('/profile/health-data', payload)
    return PatientProfileAssembler.fromApi(created)
  },

  // PUT /api/v1/profile/health-data
  async update(_userId, payload) {
    const updated = await apiService.put('/profile/health-data', payload)
    return PatientProfileAssembler.fromApi(updated)
  },

  async updateHealthData(userId, payload) {
    return this.update(userId, payload)
  },
}
