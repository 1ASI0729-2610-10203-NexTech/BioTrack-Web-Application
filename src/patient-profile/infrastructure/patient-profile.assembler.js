import { PatientProfile } from '../domain/model/patient-profile.entity'

export const PatientProfileAssembler = {
  fromApi(payload) {
    return new PatientProfile({
      id: payload.id,
      patientId: payload.patient_id,
      healthData: payload.health_data,
      dietaryRestrictions: payload.dietary_restrictions,
      nutritionalGoal: payload.nutritional_goal,
      activityLevel: payload.activity_level,
      biologicalSex: payload.biological_sex,
      createdAt: payload.created_at,
      updatedAt: payload.updated_at,
    })
  },
}
