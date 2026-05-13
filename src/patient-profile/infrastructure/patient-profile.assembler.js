import { PatientProfile } from '../domain/model/patient-profile.entity'

export const PatientProfileAssembler = {
  fromApi(payload) {
    return new PatientProfile({
      id: payload.id,
      patientId: payload.patient_id,
      firstName: payload.first_name,
      lastName: payload.last_name,
      healthData: {
        weightKg: payload.health_data?.weight_kg,
        heightCm: payload.health_data?.height_cm,
        age: payload.health_data?.age,
        biologicalSex: payload.health_data?.biological_sex,
        activityLevel: payload.health_data?.activity_level,
        systolic: payload.health_data?.blood_pressure?.systolic,
        diastolic: payload.health_data?.blood_pressure?.diastolic,
        glucoseMgDl: payload.health_data?.glucose_mg_dl,
      },
      dietaryRestrictions: payload.dietary_restrictions,
      nutritionalGoal: payload.nutritional_goal?.value ?? payload.nutritional_goal,
      restrictionsConfirmed: payload.restrictions_confirmed,
      nutritionist: payload.nutritionist,
      createdAt: payload.created_at,
      updatedAt: payload.updated_at,
    })
  },
}
