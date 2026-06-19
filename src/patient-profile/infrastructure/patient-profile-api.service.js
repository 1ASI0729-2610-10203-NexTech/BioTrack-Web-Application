import { apiService } from '../../shared/infrastructure/api.service'
import { PatientProfileAssembler } from './patient-profile.assembler'

export const patientProfileApiService = {
  async fetchProfile() {
    const payload = await apiService.get('/profile')
    return payload ? PatientProfileAssembler.fromApi(payload) : null
  },

  async updateHealthData(payload) {
    const updated = await apiService.put('/profile/health-data', {
      heightCm: payload.heightCm,
      weightKg: payload.weightKg,
      goalWeightKg: payload.goalWeightKg,
      activityLevel: payload.activityLevel,
      nutritionalObjective: payload.nutritionalObjective,
    })
    return PatientProfileAssembler.fromApi(updated)
  },

  async fetchNutritionalGoals() {
    return apiService.get('/profile/nutritional-goals')
  },

  async updateRestrictions(restrictions) {
    const updated = await apiService.put('/profile/restrictions', { restrictions })
    return PatientProfileAssembler.fromApi(updated)
  },
}
