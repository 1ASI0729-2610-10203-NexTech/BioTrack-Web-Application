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
      goalWeightKg: payload.goalWeightKg ?? payload.targetWeightKg ?? payload.weightKg,
      activityLevel: payload.activityLevel,
      nutritionalObjective: payload.nutritionalObjective ?? payload.nutritionalGoal ?? 'MAINTAIN_WEIGHT',
      age: payload.age ?? null,
      biologicalSex: payload.biologicalSex ?? null,
      systolicPressure: payload.systolicPressure ?? null,
      diastolicPressure: payload.diastolicPressure ?? null,
      glucoseMgDl: payload.glucoseMgDl ?? null,
    })
    return PatientProfileAssembler.fromApi(updated)
  },

  async updateNutritionalGoal(nutritionalObjective) {
    const updated = await apiService.put('/profile/nutritional-goal', { nutritionalObjective })
    return PatientProfileAssembler.fromApi(updated)
  },

  async fetchNutritionalGoals() {
    return apiService.get('/profile/nutritional-goals')
  },

  async updateRestrictions(restrictions) {
    const updated = await apiService.put('/profile/restrictions', { restrictions })
    return PatientProfileAssembler.fromApi(updated)
  },

  async fetchByUserId(_userId) {
    const payload = await apiService.get('/profile')
    return payload ? PatientProfileAssembler.fromApi(payload) : null
  },

  async update(_profileId, data) {
    const updated = await apiService.put('/profile/health-data', {
      heightCm: data.heightCm ?? null,
      weightKg: data.weightKg ?? null,
      goalWeightKg: data.goalWeightKg ?? null,
      activityLevel: data.activityLevel ?? null,
      nutritionalObjective: data.nutritionalObjective ?? null,
    })
    return PatientProfileAssembler.fromApi(updated)
  },
}
