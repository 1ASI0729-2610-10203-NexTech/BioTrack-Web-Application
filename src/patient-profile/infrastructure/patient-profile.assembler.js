import { PatientProfile } from '../domain/model/patient-profile.entity'

export const PatientProfileAssembler = {
  fromApi(payload) {
    const biologicalSexByApi = {
      MALE: 'masculino',
      FEMALE: 'femenino',
      OTHER: 'otro',
    }
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
    const hasHealthData = [
      payload.weightKg,
      payload.heightCm,
      payload.age,
      payload.biologicalSex,
      payload.activityLevel,
      payload.systolicPressure,
      payload.diastolicPressure,
      payload.basalGlucose,
    ].every((value) => value !== null && value !== undefined && value !== '')

    return new PatientProfile({
      id: payload.id,
      patientId: payload.userId,
      firstName: payload.firstName ?? 'Juan',
      lastName: payload.lastName ?? 'Pérez',
      healthData: hasHealthData
        ? {
            weightKg: payload.weightKg,
            heightCm: payload.heightCm,
            age: payload.age,
            biologicalSex: biologicalSexByApi[payload.biologicalSex] ?? payload.biologicalSex,
            activityLevel: activityLevelByApi[payload.activityLevel] ?? payload.activityLevel,
            systolic: payload.systolicPressure,
            diastolic: payload.diastolicPressure,
            glucoseMgDl: payload.basalGlucose,
          }
        : null,
      dietaryRestrictions: payload.dietaryRestrictions?.length
        ? payload.dietaryRestrictions
        : ['Sin restricciones'],
      nutritionalGoal:
        goalByApi[payload.nutritionalGoal ?? payload.nutritionalObjective] ??
        payload.nutritionalGoal ??
        payload.nutritionalObjective,
      restrictionsConfirmed: payload.restrictionsConfirmed,
      nutritionist: payload.nutritionist ?? 'Dra. Ana Torres',
      targetWeightKg: payload.targetWeightKg ?? payload.goalWeightKg,
      createdAt: payload.createdAt,
      updatedAt: payload.updatedAt,
    })
  },
}
