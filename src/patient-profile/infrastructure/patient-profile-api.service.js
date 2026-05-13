import { apiService } from '../../shared/infrastructure/api.service'
import { PatientProfileAssembler } from './patient-profile.assembler'

export const patientProfileApiService = {
  async fetchCurrent() {
    const payload = await apiService.get('/patient-profile/current')
    return PatientProfileAssembler.fromApi(payload)
  },
}
