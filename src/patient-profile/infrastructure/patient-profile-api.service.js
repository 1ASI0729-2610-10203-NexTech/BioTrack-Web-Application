import { apiService } from '../../shared/infrastructure/api.service'
import { PatientProfileAssembler } from './patient-profile.assembler'

export const patientProfileApiService = {
  async fetchProfile() {
    try {
      const payload = await apiService.get('/profile', { suppressErrorLog: true })
      return payload ? PatientProfileAssembler.fromApi(payload) : null
    } catch (error) {
      if (error.status === 404) return null
      throw error
    }
  },

  async updateHealthData(payload) {
    const updated = await apiService.put('/profile/health-data', {
      heightCm: Number(payload.heightCm),
      weightKg: Number(payload.weightKg),
      goalWeightKg: Number(
        payload.goalWeightKg ?? payload.targetWeightKg ?? payload.weightKg,
      ),
      activityLevel: payload.activityLevel,
      nutritionalObjective: payload.nutritionalObjective ?? payload.nutritionalGoal ?? 'MAINTAIN_WEIGHT',
    })
    return PatientProfileAssembler.fromApi(updated)
  },

  async updateNutritionalGoal(nutritionalObjective) {
    const current = await apiService.get('/profile')
    const updated = await apiService.put('/profile/health-data', {
      heightCm: current.heightCm,
      weightKg: current.weightKg,
      goalWeightKg: current.goalWeightKg,
      activityLevel: current.activityLevel,
      nutritionalObjective,
    })
    return PatientProfileAssembler.fromApi(updated)
  },

  async fetchNutritionalGoals() {
    return apiService.get('/profile/nutritional-goals')
  },

  async updateRestrictions(restrictions) {
    const serializedRestrictions = Array.isArray(restrictions)
      ? restrictions.join(', ')
      : String(restrictions ?? '')
    await apiService.put('/profile/restrictions', {
      restrictions: serializedRestrictions,
    })
    const persisted = await apiService.get('/profile')
    const persistedRestrictions = String(persisted?.dietaryRestrictions ?? '').trim()
    if (persistedRestrictions !== serializedRestrictions.trim()) {
      throw new Error(
        'El backend respondió 200, pero no persistió las restricciones enviadas.',
      )
    }
    return PatientProfileAssembler.fromApi(persisted)
  },

  async fetchByUserId(_userId) {
    return this.fetchProfile()
  },

  async update(_profileId, data) {
    const current = await apiService.get('/profile')
    const updated = await apiService.put('/profile/health-data', {
      heightCm: data.heightCm ?? current.heightCm,
      weightKg: data.weightKg ?? current.weightKg,
      goalWeightKg: data.goalWeightKg ?? data.targetWeightKg ?? current.goalWeightKg,
      activityLevel: data.activityLevel ?? current.activityLevel,
      nutritionalObjective:
        data.nutritionalObjective ?? data.nutritionalGoal ?? current.nutritionalObjective,
    })
    return PatientProfileAssembler.fromApi(updated)
  },

  async create(data) {
    return this.updateHealthData(data)
  },
}
