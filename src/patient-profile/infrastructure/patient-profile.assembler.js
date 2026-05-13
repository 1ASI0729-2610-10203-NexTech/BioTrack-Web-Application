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

    return new PatientProfile({
      id: payload.id,
      patientId: payload.userId,
      firstName: payload.firstName ?? 'Juan',
      lastName: payload.lastName ?? 'Pérez',
      healthData: {
        weightKg: payload.weightKg,
        heightCm: payload.heightCm,
        age: payload.age,
        biologicalSex: biologicalSexByApi[payload.biologicalSex] ?? payload.biologicalSex,
        activityLevel: activityLevelByApi[payload.activityLevel] ?? payload.activityLevel,
        systolic: payload.systolicPressure,
        diastolic: payload.diastolicPressure,
        glucoseMgDl: payload.basalGlucose,
      },
      dietaryRestrictions: payload.dietaryRestrictions?.length
        ? payload.dietaryRestrictions
        : ['Sin restricciones'],
      nutritionalGoal: goalByApi[payload.nutritionalGoal] ?? payload.nutritionalGoal,
      restrictionsConfirmed: payload.restrictionsConfirmed,
      nutritionist: payload.nutritionist ?? 'Dra. Ana Torres',
      targetWeightKg: payload.targetWeightKg,
      createdAt: payload.createdAt,
      updatedAt: payload.updatedAt,
    })
  },
}
