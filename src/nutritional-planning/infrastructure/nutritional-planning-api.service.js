import { apiService } from '../../shared/infrastructure/api.service'
import {
  calculateRemainingToGoal,
  calculateWeightChange,
  getCurrentWeight,
  getInitialWeight,
  getTargetWeight,
  sortWeightRecordsByDate,
} from '../../progress-tracking/domain/model/weight-progress.helpers'
import { calculateBMI, getBMIStatus } from '../../patient-profile/domain/model/bmi.value-object'

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function goalLabel(goal) {
  const labels = {
    LOSE_WEIGHT: 'Bajar de peso',
    MAINTAIN_WEIGHT: 'Mantener peso',
    GAIN_MUSCLE: 'Ganar masa muscular',
  }
  return labels[goal] ?? 'Sin objetivo'
}

function getFullName(user) {
  return user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Paciente'
}

function calculateAdherence(foodLogs = [], plan = null) {
  const targetCalories = Number(plan?.dailyCalories ?? 0)
  if (!targetCalories) return { percentage: 0, label: 'Baja', totalCalories: 0 }
  const totalCalories = foodLogs.reduce((total, log) => total + Number(log.calories || 0), 0)
  const percentage = Math.min((totalCalories / targetCalories) * 100, 100)
  const label = percentage >= 90 ? 'Excelente' : percentage >= 70 ? 'Buena' : 'Baja'
  return {
    percentage: Number(percentage.toFixed(0)),
    label,
    totalCalories,
  }
}

function buildPatientSummary({
  profile,
  user,
  plan = null,
  foodLogs = [],
  weightRecords = [],
  evaluations = [],
  followUpNotes = [],
}) {
  const sortedWeights = sortWeightRecordsByDate(weightRecords)
  const profileForWeight = {
    healthData: {
      weightKg: profile.weightKg,
      heightCm: profile.heightCm,
    },
    nutritionalGoal: profile.nutritionalGoal,
    targetWeightKg: profile.targetWeightKg,
  }
  const initialWeight = getInitialWeight(sortedWeights, profileForWeight)
  const currentWeight = getCurrentWeight(sortedWeights, profileForWeight)
  const targetWeight = getTargetWeight(profileForWeight, initialWeight)
  const currentBmi = currentWeight && profile.heightCm ? calculateBMI(currentWeight, profile.heightCm).value : null
  const adherence = calculateAdherence(foodLogs, plan)

  return {
    id: profile.id,
    userId: profile.userId,
    name: getFullName(user),
    email: user?.email ?? '',
    age: profile.age,
    weightKg: profile.weightKg,
    heightCm: profile.heightCm,
    biologicalSex: profile.biologicalSex,
    activityLevel: profile.activityLevel,
    systolicPressure: profile.systolicPressure,
    diastolicPressure: profile.diastolicPressure,
    basalGlucose: profile.basalGlucose,
    bmi: Number((currentBmi ?? profile.bmi ?? 0).toFixed(1)),
    bmiStatus: getBMIStatus(currentBmi ?? profile.bmi),
    nutritionalGoal: profile.nutritionalGoal,
    nutritionalGoalLabel: goalLabel(profile.nutritionalGoal),
    targetWeightKg: targetWeight,
    dietaryRestrictions: profile.dietaryRestrictions ?? [],
    restrictionsConfirmed: Boolean(profile.restrictionsConfirmed),
    isComplete: Boolean(profile.isComplete),
    updatedAt: profile.updatedAt ?? '',
    plan,
    planStatus: plan?.status ?? 'NONE',
    dailyCalories: plan?.dailyCalories ?? null,
    macros: plan
      ? {
          proteins: plan.proteinPercentage,
          carbohydrates: plan.carbohydratePercentage,
          fats: plan.fatPercentage,
        }
      : null,
    adherence,
    initialWeight,
    currentWeight,
    weightChange: calculateWeightChange(initialWeight, currentWeight),
    remainingToGoal: calculateRemainingToGoal(currentWeight, targetWeight, profile.nutritionalGoal),
    foodLogs,
    weightRecords: sortedWeights,
    evaluations,
    followUpNotes,
    lastEvaluation: evaluations.at(-1) ?? null,
    lastNote: followUpNotes.at(-1) ?? null,
  }
}

async function resolveNutritionistByUserId(userId) {
  const nutritionists = await apiService.get('/nutritionists', { params: { userId } })
  const nutritionist = Array.isArray(nutritionists) ? nutritionists[0] : nutritionists
  if (!nutritionist) throw new Error('No existe un perfil de nutricionista asociado al usuario.')
  return nutritionist
}

async function fetchAssignedPatientIds(nutritionistId) {
  const assignments = await apiService.get('/nutritionist-assignments', {
    params: { nutritionistId },
  })
  return (Array.isArray(assignments) ? assignments : [])
    .filter((assignment) => assignment.status === 'ACTIVE')
    .map((assignment) => Number(assignment.patientId))
}

async function ensureAssignedPatient(nutritionistId, patientId) {
  const patientIds = await fetchAssignedPatientIds(nutritionistId)
  if (!patientIds.includes(Number(patientId))) {
    throw new Error('El paciente no está asignado a este nutricionista.')
  }
}

async function fetchPatientBundle(patientId) {
  const [profile, user, nutritionalPlans, foodLogs, weightRecords, evaluations, followUpNotes] =
    await Promise.all([
      apiService.get(`/patients/${patientId}/health-profile`),
      apiService.get(`/users/${patientId}`),
      apiService.get('/nutritional-plans', { params: { patientId } }),
      apiService.get(`/patients/${patientId}/food-log`),
      apiService.get(`/patients/${patientId}/weight`),
      apiService.get('/evaluations', { params: { patientId } }),
      apiService.get('/follow-up-notes', { params: { patientId } }),
    ])

  const plans = Array.isArray(nutritionalPlans) ? nutritionalPlans : []

  return buildPatientSummary({
    profile,
    user,
    plan: plans.at(-1) ?? null,
    foodLogs: Array.isArray(foodLogs) ? foodLogs : [],
    weightRecords: Array.isArray(weightRecords) ? weightRecords : [],
    evaluations: Array.isArray(evaluations) ? evaluations : [],
    followUpNotes: Array.isArray(followUpNotes) ? followUpNotes : [],
  })
}

export const nutritionalPlanningApiService = {
  async resolveNutritionistContext(userId) {
    const nutritionist = await resolveNutritionistByUserId(userId)
    const patientIds = await fetchAssignedPatientIds(nutritionist.id)
    return { nutritionist, patientIds }
  },

  async fetchAssignedPatients(userId) {
    const { nutritionist, patientIds } = await this.resolveNutritionistContext(userId)
    const patients = await Promise.all(patientIds.map((patientId) => fetchPatientBundle(patientId)))
    return { nutritionist, patients }
  },

  async fetchAssignedPatientDetail(userId, patientId) {
    const { nutritionist } = await this.resolveNutritionistContext(userId)
    await ensureAssignedPatient(nutritionist.id, patientId)
    const patient = await fetchPatientBundle(patientId)
    return { nutritionist, patient }
  },

  async createEvaluation(userId, patientId, payload) {
    const { nutritionist } = await this.resolveNutritionistContext(userId)
    await ensureAssignedPatient(nutritionist.id, patientId)
    return apiService.post('/evaluations', {
      nutritionistId: nutritionist.id,
      patientId: Number(patientId),
      observations: payload.observations,
      targetCalories: Number(payload.targetCalories),
      proteinPercentage: Number(payload.proteinPercentage),
      carbohydratePercentage: Number(payload.carbohydratePercentage),
      fatPercentage: Number(payload.fatPercentage),
      status: 'COMPLETED',
      completedAt: new Date().toISOString(),
    })
  },

  // TS05 — POST /api/v1/nutritional-plans
  async createPlan(userId, patientId, payload) {
    const { nutritionist } = await this.resolveNutritionistContext(userId)
    await ensureAssignedPatient(nutritionist.id, patientId)
    const profile = await apiService.get(`/patients/${patientId}/health-profile`)
    if (!profile.isComplete) throw new Error('No se puede crear un plan para un perfil incompleto.')

    return apiService.post('/nutritional-plans', {
      patientId: Number(patientId),
      nutritionistId: nutritionist.id,
      name: payload.name,
      description: payload.description,
      objective: goalLabel(profile.nutritionalGoal),
      dailyCalories: Number(payload.dailyCalories),
      proteinPercentage: Number(payload.proteinPercentage),
      carbohydratePercentage: Number(payload.carbohydratePercentage),
      fatPercentage: Number(payload.fatPercentage),
      status: 'PROPOSED',
      createdAt: todayIso(),
    })
  },

  async updatePlanStatus(userId, patientId, planId, status) {
    const { nutritionist } = await this.resolveNutritionistContext(userId)
    await ensureAssignedPatient(nutritionist.id, patientId)
    const endpoint = status === 'ACTIVATED' ? 'accept' : 'reject'
    return apiService.patch(`/nutritional-plans/${planId}/${endpoint}`, {
      rejectedReason: status === 'REJECTED' ? 'Rechazado por seguimiento nutricional' : undefined,
    })
  },

  async saveFollowUpNote(userId, patientId, note) {
    const { nutritionist } = await this.resolveNutritionistContext(userId)
    await ensureAssignedPatient(nutritionist.id, patientId)
    return apiService.post('/follow-up-notes', {
      nutritionistId: nutritionist.id,
      patientId: Number(patientId),
      note,
      createdAt: new Date().toISOString(),
    })
  },

  async fetchPatientProgress(userId, patientId) {
    return this.fetchAssignedPatientDetail(userId, patientId)
  },
}
