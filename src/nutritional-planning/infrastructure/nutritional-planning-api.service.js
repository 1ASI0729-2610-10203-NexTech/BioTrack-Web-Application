import { apiService } from '../../shared/infrastructure/api.service'
import { NutritionalPlanAssembler } from './nutritional-plan.assembler'

function mapPatient(raw) {
  const name = [raw.firstName, raw.lastName].filter(Boolean).join(' ') || raw.email || 'Paciente'
  const plan = raw.plan ?? null
  return {
    id: raw.id,
    userId: raw.id,
    name,
    firstName: raw.firstName ?? '',
    lastName: raw.lastName ?? '',
    email: raw.email ?? '',
    age: raw.age ?? null,
    weightKg: raw.weightKg ?? null,
    currentWeight: raw.weightKg ?? null,
    heightCm: raw.heightCm ?? null,
    bmi: raw.bmi ?? null,
    biologicalSex: raw.biologicalSex ?? null,
    activityLevel: raw.activityLevel ?? null,
    nutritionalGoal: raw.nutritionalGoal ?? null,
    nutritionalGoalLabel: raw.nutritionalGoalLabel ?? '—',
    isComplete: Boolean(raw.isComplete),
    planStatus: plan?.status ?? 'NONE',
    plan,
    adherence: raw.adherence ?? { percentage: 0, label: 'Sin datos' },
    evaluations: raw.evaluations ?? [],
    followUpNotes: raw.followUpNotes ?? [],
    updatedAt: raw.updatedAt ?? '',
  }
}

export const nutritionalPlanningApiService = {
  async fetchPlans() {
    const plans = await apiService.get('/nutritional-plans')
    return (Array.isArray(plans) ? plans : []).map(NutritionalPlanAssembler.fromApi)
  },

  // POST /api/v1/nutritional-plans — incluye patientId para ligar el plan al paciente
  async createPlan(_nutritionistUserId, patientId, payload) {
    const created = await apiService.post('/nutritional-plans', {
      name: payload.name,
      calorieTarget: Number(payload.dailyCalories ?? payload.calorieTarget),
      proteinGrams: Number(payload.proteinGrams ?? payload.proteinPercentage),
      carbsGrams: Number(payload.carbsGrams ?? payload.carbohydratePercentage),
      fatGrams: Number(payload.fatGrams ?? payload.fatPercentage),
      patientId: patientId ? Number(patientId) : undefined,
    })
    return { plan: NutritionalPlanAssembler.fromApi(created) }
  },

  async fetchWeeklyDiet(planId) {
    return apiService.get(`/nutritional-plans/${planId}/weekly-diet`)
  },

  // GET /api/v1/nutritional-plans/my-patients
  async fetchAssignedPatients(_nutritionistUserId) {
    const data = await apiService.get('/nutritional-plans/my-patients')
    return {
      nutritionist: data.nutritionist ?? {},
      patients: (Array.isArray(data.patients) ? data.patients : []).map(mapPatient),
    }
  },

  // GET /api/v1/nutritional-plans/my-patients → filtra por patientId
  // Si no está en my-patients, lo busca en /users/:id
  async fetchAssignedPatientDetail(_nutritionistUserId, patientId) {
    const data = await apiService.get('/nutritional-plans/my-patients')
    const patients = (Array.isArray(data.patients) ? data.patients : []).map(mapPatient)
    let patient = patients.find((p) => String(p.id) === String(patientId)) ?? null
    if (!patient) {
      try {
        const raw = await apiService.get(`/users/${patientId}`)
        patient = raw ? mapPatient(raw) : null
      } catch {
        patient = null
      }
    }
    return { nutritionist: data.nutritionist ?? {}, patient }
  },

  // GET /api/v1/users/patients — todos los pacientes registrados
  async fetchAllPatients() {
    const users = await apiService.get('/users/patients')
    return (Array.isArray(users) ? users : []).map((u) => mapPatient(u))
  },

  async createEvaluation(_nutritionistUserId, _patientId, _payload) {
    return null
  },

  async updatePlanStatus(_nutritionistUserId, _patientId, _planId, _status) {
    return null
  },

  async saveFollowUpNote(_nutritionistUserId, _patientId, _note) {
    return null
  },
}
