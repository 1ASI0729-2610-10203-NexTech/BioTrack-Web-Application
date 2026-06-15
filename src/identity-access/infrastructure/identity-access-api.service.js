import { apiService } from '../../shared/infrastructure/api.service'

const DEFAULT_NUTRITIONIST_USER_EMAIL = 'nutricionista@biotrack.com'

async function findDefaultNutritionist() {
  const users = await apiService.get('/users', {
    params: { email: DEFAULT_NUTRITIONIST_USER_EMAIL },
  })
  const defaultNutritionistUser = users[0]
  if (!defaultNutritionistUser) return null

  const nutritionists = await apiService.get('/nutritionists', {
    params: { userId: defaultNutritionistUser.id },
  })
  return nutritionists[0] ?? null
}

async function createPatientProfileForUser(user, nutritionist) {
  const existingProfiles = await apiService.get('/patientProfiles', {
    params: { userId: user.id },
  })
  if (existingProfiles[0]) return existingProfiles[0]

  return apiService.post('/patientProfiles', {
    userId: user.id,
    weightKg: null,
    heightCm: null,
    age: null,
    biologicalSex: null,
    activityLevel: null,
    systolicPressure: null,
    diastolicPressure: null,
    basalGlucose: null,
    bmi: null,
    nutritionalGoal: null,
    targetWeightKg: null,
    dietaryRestrictions: [],
    restrictionsConfirmed: false,
    isComplete: false,
    assignedNutritionistId: nutritionist?.id ?? null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })
}

async function assignPatientToNutritionist(patientProfile, nutritionist) {
  if (!patientProfile?.id || !nutritionist?.id) return null

  const assignments = await apiService.get('/nutritionistAssignments', {
    params: {
      patientId: patientProfile.id,
      nutritionistId: nutritionist.id,
    },
  })
  const activeAssignment = assignments.find((assignment) => assignment.status === 'ACTIVE')
  if (activeAssignment) return activeAssignment

  const assignment = await apiService.post('/nutritionistAssignments', {
    patientId: patientProfile.id,
    nutritionistId: nutritionist.id,
    assignedAt: new Date().toISOString().slice(0, 10),
    status: 'ACTIVE',
  })

  const allAssignments = await apiService.get('/nutritionistAssignments', {
    params: { nutritionistId: nutritionist.id },
  })
  const assignedPatientsCount = allAssignments.filter(
    (candidate) => candidate.status === 'ACTIVE',
  ).length

  await apiService.patch(`/nutritionists/${nutritionist.id}`, {
    assignedPatientsCount,
  })

  return assignment
}

async function onboardPatientWithDefaultNutritionist(user) {
  const nutritionist = await findDefaultNutritionist()
  const patientProfile = await createPatientProfileForUser(user, nutritionist)
  await assignPatientToNutritionist(patientProfile, nutritionist)
  return { nutritionist, patientProfile }
}

export const identityAccessApiService = {
  async login(credentials) {
    const users = await apiService.get('/users', {
      params: {
        email: String(credentials.email ?? '').trim().toLowerCase(),
        password: credentials.password,
      },
    })

    return users[0] ?? null
  },

  async register(command) {
    const roleByAccountType = {
      paciente: 'PACIENTE',
      nutricionista: 'NUTRICIONISTA',
      corporativo: 'ADMIN_CORPORATIVO',
    }
    const validRoles = ['PACIENTE', 'NUTRICIONISTA', 'ADMIN_CORPORATIVO']
    const requestedRole = validRoles.includes(command.role)
      ? command.role
      : roleByAccountType[command.accountType]

    const createdUser = await apiService.post('/users', {
      name: `${command.firstName} ${command.lastName}`.trim(),
      email: String(command.email ?? '').trim().toLowerCase(),
      password: command.password,
      role: requestedRole ?? 'PACIENTE',
      status: 'PENDING_VERIFICATION',
      emailVerified: false,
    })

    if (createdUser.role === 'PACIENTE') {
      await onboardPatientWithDefaultNutritionist(createdUser)
    }

    return createdUser
  },

  async verifyEmail(userId) {
    return apiService.patch(`/users/${userId}`, {
      emailVerified: true,
      status: 'ACTIVE',
    })
  },

  async fetchUserById(userId) {
    return apiService.get(`/users/${userId}`)
  },
}
