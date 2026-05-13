import { apiService } from '../../shared/infrastructure/api.service'
import { PatientProfileAssembler } from './patient-profile.assembler'

const jsonServerBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1')
  .replace(/\/api\/v1\/?$/, '')
  .replace(/\/$/, '')

export const patientProfileApiService = {
  async fetchByUserId(userId) {
    const payloads = await apiService.get(`${jsonServerBaseUrl}/patientProfiles`)
    const payload = payloads.find((profile) => profile.userId === userId)
    return payload ? PatientProfileAssembler.fromApi(payload) : null
  },

  async update(profileId, payload) {
    const updated = await apiService.patch(`${jsonServerBaseUrl}/patientProfiles/${profileId}`, payload)
    return PatientProfileAssembler.fromApi(updated)
  },

  async create(payload) {
    const created = await apiService.post(`${jsonServerBaseUrl}/patientProfiles`, payload)
    return PatientProfileAssembler.fromApi(created)
  },

  async updateHealthData(profileId, payload) {
    return this.update(profileId, payload)
  },
}
