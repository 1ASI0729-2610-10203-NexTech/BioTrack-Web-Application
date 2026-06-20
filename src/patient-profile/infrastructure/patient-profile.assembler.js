import { PatientProfile } from '../domain/model/patient-profile.entity'

export const PatientProfileAssembler = {
  fromApi(payload) {
    const activityLevelByApi = {
      LOW: 'sedentaria',
      MODERATE: 'moderada',
      HIGH: 'activa',
    }
    const goalByApi = {
      LOSE_WEIGHT: 'bajar-peso',
      MAINTAIN_WEIGHT: 'mantener-peso',
      GAIN_MUSCLE: 'ganar-masa',
    }

    return new PatientProfile({
      id: payload.id,
      patientId: payload.userId,
      healthData: {
        weightKg: payload.weightKg,
        heightCm: payload.heightCm,
        activityLevel: activityLevelByApi[payload.activityLevel] ?? payload.activityLevel,
        age: payload.age ?? null,
        biologicalSex: payload.biologicalSex ?? null,
        systolic: payload.systolicPressure ?? null,
        diastolic: payload.diastolicPressure ?? null,
        glucoseMgDl: payload.glucoseMgDl ?? null,
      },
      bmi: payload.bmi,
      goalWeightKg: payload.goalWeightKg,
      targetWeightKg: payload.goalWeightKg,
      dietaryRestrictions: payload.dietaryRestrictions
        ? payload.dietaryRestrictions.split(',').map((r) => r.trim()).filter(Boolean)
        : ['Sin restricciones'],
      nutritionalGoal: goalByApi[payload.nutritionalObjective] ?? payload.nutritionalObjective,
      updatedAt: payload.updatedAt,
    })
  },
}
