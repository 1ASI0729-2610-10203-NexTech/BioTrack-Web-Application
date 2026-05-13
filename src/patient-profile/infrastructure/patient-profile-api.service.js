import { apiService } from '../../shared/infrastructure/api.service'
import { PatientProfileAssembler } from './patient-profile.assembler'

export const patientProfileApiService = {
  async fetchByUserId(userId) {
    const payloads = await apiService.get('/patient-profiles')
    const payload = payloads.find((profile) => profile.userId === userId)
    return payload ? PatientProfileAssembler.fromApi(payload) : null
  },

  async update(profileId, payload) {
    const updated = await apiService.patch(`/patient-profiles/${profileId}`, payload)
    return PatientProfileAssembler.fromApi(updated)
  },
}
