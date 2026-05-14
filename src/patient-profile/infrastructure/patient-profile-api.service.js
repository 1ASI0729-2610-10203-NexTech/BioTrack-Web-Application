import { apiService } from '../../shared/infrastructure/api.service'
import { PatientProfileAssembler } from './patient-profile.assembler'

export const patientProfileApiService = {
  async fetchByUserId(userId) {
    const payloads = await apiService.get('/patientProfiles')
    const payload = payloads.find((profile) => profile.userId === userId)
    return payload ? PatientProfileAssembler.fromApi(payload) : null
  },

  async update(profileId, payload) {
    const updated = await apiService.patch(`/patientProfiles/${profileId}`, payload)
    return PatientProfileAssembler.fromApi(updated)
  },

  async create(payload) {
    const created = await apiService.post('/patientProfiles', payload)
    return PatientProfileAssembler.fromApi(created)
  },

  async updateHealthData(profileId, payload) {
    return this.update(profileId, payload)
  },
}
