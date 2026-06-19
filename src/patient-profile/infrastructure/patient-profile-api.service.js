import { apiService } from '../../shared/infrastructure/api.service'
import { PatientProfileAssembler } from './patient-profile.assembler'

export const patientProfileApiService = {
  // TS04 — GET /api/v1/patients/{id}/health-profile
  async fetchByUserId(userId) {
    const payload = await apiService.get(`/patients/${userId}/health-profile`)
    return payload ? PatientProfileAssembler.fromApi(payload) : null
  },

  // TS04 — POST /api/v1/patients/{id}/health-profile
  async create(userId, payload) {
    const created = await apiService.post(`/patients/${userId}/health-profile`, payload)
    return PatientProfileAssembler.fromApi(created)
  },

  // PATCH /api/v1/patients/{id}/health-profile
  async update(userId, payload) {
    const updated = await apiService.patch(`/patients/${userId}/health-profile`, payload)
    return PatientProfileAssembler.fromApi(updated)
  },

  async updateHealthData(userId, payload) {
    return this.update(userId, payload)
  },
}
