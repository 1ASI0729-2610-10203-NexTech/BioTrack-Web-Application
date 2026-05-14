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

const defaultMeals = [
  {
    type: 'desayuno',
    name: 'Avena con leche + plátano',
    description: 'Fibra y energía sostenida.',
    calories: 380,
  },
  {
    type: 'almuerzo',
    name: 'Arroz integral + pollo a la plancha + ensalada',
    description: 'Proteína magra y vegetales.',
    calories: 620,
  },
  {
    type: 'merienda',
    name: 'Yogur griego + almendras',
    description: 'Snack alto en proteína.',
    calories: 230,
  },
  {
    type: 'cena',
    name: 'Crema de verduras + pan integral',
    description: 'Cena ligera.',
    calories: 380,
  },
]

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function createDefaultWeeklyDietDays() {
  return ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((name) => ({
    name,
    meals: defaultMeals,
  }))
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
  const nutritionist = nutritionists[0]
  if (!nutritionist) throw new Error('No existe un perfil de nutricionista asociado al usuario.')
  return nutritionist
}

async function fetchAssignedPatientIds(nutritionistId) {
  const assignments = await apiService.get('/nutritionistAssignments', {
    params: { nutritionistId },
  })
  return assignments
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
  const [profile, users, patientPlans, foodLogs, weightRecords, evaluations, followUpNotes] =
    await Promise.all([
      apiService.get(`/patientProfiles/${patientId}`),
      apiService.get('/users'),
      apiService.get('/patientPlans', { params: { patientId } }),
      apiService.get('/foodLogs', { params: { patientId } }),
      apiService.get('/weightRecords', { params: { patientId } }),
      apiService.get('/evaluations', { params: { patientId } }),
      apiService.get('/followUpNotes', { params: { patientId } }),
    ])

  return buildPatientSummary({
    profile,
    user: users.find((user) => user.id === profile.userId),
    plan: patientPlans.at(-1) ?? null,
    foodLogs,
    weightRecords,
    evaluations,
    followUpNotes,
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

  async createPlan(userId, patientId, payload) {
    const { nutritionist } = await this.resolveNutritionistContext(userId)
    await ensureAssignedPatient(nutritionist.id, patientId)
    const profile = await apiService.get(`/patientProfiles/${patientId}`)
    if (!profile.isComplete) throw new Error('No se puede crear un plan para un perfil incompleto.')

    const createdPlan = await apiService.post('/patientPlans', {
      patientId: Number(patientId),
      nutritionistId: nutritionist.id,
      name: payload.name,
      description: payload.description,
      objective: goalLabel(profile.nutritionalGoal).toLowerCase(),
      dailyCalories: Number(payload.dailyCalories),
      proteinPercentage: Number(payload.proteinPercentage),
      carbohydratePercentage: Number(payload.carbohydratePercentage),
      fatPercentage: Number(payload.fatPercentage),
      status: 'PROPOSED',
      createdAt: todayIso(),
      activatedAt: null,
      rejectedReason: null,
    })

    const weeklyDiet = await apiService.post('/weeklyDiets', {
      planId: createdPlan.id,
      weekNumber: 1,
      days: createDefaultWeeklyDietDays(),
    })

    return { plan: createdPlan, weeklyDiet }
  },

  async updatePlanStatus(userId, patientId, planId, status) {
    const { nutritionist } = await this.resolveNutritionistContext(userId)
    await ensureAssignedPatient(nutritionist.id, patientId)
    const plan = await apiService.get(`/patientPlans/${planId}`)
    if (Number(plan.patientId) !== Number(patientId) || Number(plan.nutritionistId) !== Number(nutritionist.id)) {
      throw new Error('No puedes editar planes de pacientes no asignados.')
    }
    return apiService.patch(`/patientPlans/${planId}`, {
      status,
      activatedAt: status === 'ACTIVATED' ? todayIso() : plan.activatedAt ?? null,
      rejectedReason: status === 'REJECTED' ? 'Rechazado por seguimiento nutricional' : null,
    })
  },

  async saveFollowUpNote(userId, patientId, note) {
    const { nutritionist } = await this.resolveNutritionistContext(userId)
    await ensureAssignedPatient(nutritionist.id, patientId)
    return apiService.post('/followUpNotes', {
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
