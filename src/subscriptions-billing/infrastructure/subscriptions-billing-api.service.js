import { apiService } from '../../shared/infrastructure/api.service'
import { SubscriptionPlan } from '../domain/model/subscription-plan.entity'
import { IndividualSubscription } from '../domain/model/individual-subscription.entity'
import { Payment } from '../domain/model/payment.entity'
import { Invoice } from '../domain/model/invoice.entity'

const jsonServerBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1')
  .replace(/\/api\/v1\/?$/, '')
  .replace(/\/$/, '')

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

function createDefaultWeeklyDietDays() {
  return ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((name) => ({
    name,
    meals: defaultMeals,
  }))
}

function getRenewalDate() {
  const renewalDate = new Date()
  renewalDate.setMonth(renewalDate.getMonth() + 1)
  return renewalDate.toISOString().slice(0, 10)
}

export const subscriptionsBillingApiService = {
  async fetchPlans() {
    const plans = await apiService.get(`${jsonServerBaseUrl}/subscriptionPlans`)
    return plans.map(
      (plan) =>
        new SubscriptionPlan({
          id: plan.id,
          name: plan.name,
          price: plan.price,
          description: plan.description,
          featured: Boolean(plan.featured),
        }),
    )
  },

  async fetchActiveSubscription(userId) {
    const subscriptions = await apiService.get(`${jsonServerBaseUrl}/subscriptions`)
    const subscription = subscriptions.find(
      (candidate) => candidate.userId === userId && candidate.status === 'ACTIVE',
    )
    if (!subscription) return null
    const plans = await apiService.get(`${jsonServerBaseUrl}/subscriptionPlans`)
    const plan = plans.find((candidate) => candidate.id === subscription.planId)
    const payments = (await apiService.get(`${jsonServerBaseUrl}/payments`)).filter(
      (payment) => payment.subscriptionId === subscription.id,
    )
    const invoice = (await apiService.get(`${jsonServerBaseUrl}/invoices`)).find(
      (candidate) => candidate.subscriptionId === subscription.id,
    )

    return {
      subscription,
      entity: new IndividualSubscription({
        planId: subscription.planId,
        planName: plan?.name ?? 'Plan activo',
        status: subscription.status,
        activatedAt: subscription.startedAt,
        renewsAt: subscription.nextRenewalAt,
      }),
      payments: payments.map(
        (payment) =>
          new Payment({
            planName: plan?.name ?? 'Plan activo',
            amount: payment.amount,
            paidAt: payment.paidAt,
            cardLastFourDigits: payment.cardLastFourDigits,
          }),
      ),
      invoice: invoice
        ? new Invoice({
            number: invoice.number,
            issuedAt: invoice.issuedAt,
          })
        : null,
    }
  },

  async subscribeToPlan({ userId, plan }) {
    const existing = (await apiService.get(`${jsonServerBaseUrl}/subscriptions`)).filter(
      (subscription) => subscription.userId === userId && subscription.status === 'ACTIVE',
    )
    const today = new Date().toISOString().slice(0, 10)
    const nextRenewalAt = getRenewalDate()

    const subscription = existing[0]
      ? await apiService.patch(`${jsonServerBaseUrl}/subscriptions/${existing[0].id}`, {
          planId: plan.id,
          status: 'ACTIVE',
          startedAt: today,
          nextRenewalAt,
        })
      : await apiService.post(`${jsonServerBaseUrl}/subscriptions`, {
          userId,
          planId: plan.id,
          status: 'ACTIVE',
          startedAt: today,
          nextRenewalAt,
        })

    const sameActivePlan = existing[0]?.planId === plan.id
    const existingPayments = (await apiService.get(`${jsonServerBaseUrl}/payments`)).filter(
      (payment) => payment.subscriptionId === subscription.id,
    )
    const existingInvoices = (await apiService.get(`${jsonServerBaseUrl}/invoices`)).filter(
      (invoice) => invoice.subscriptionId === subscription.id,
    )

    const payment =
      sameActivePlan && existingPayments.length
        ? existingPayments.at(-1)
        : await apiService.post(`${jsonServerBaseUrl}/payments`, {
            subscriptionId: subscription.id,
            userId,
            planId: plan.id,
            amount: plan.price,
            currency: 'PEN',
            status: 'PAID',
            paidAt: today,
            cardLastFourDigits: '4521',
          })

    const invoice =
      sameActivePlan && existingInvoices.length
        ? existingInvoices.at(-1)
        : await apiService.post(`${jsonServerBaseUrl}/invoices`, {
            subscriptionId: subscription.id,
            number: `INV-${today.replaceAll('-', '')}-${subscription.id}`,
            issuedAt: today,
            status: 'PAID',
          })

    const shouldActivateNutrition = ['Profesional', 'Premium'].includes(plan.name)
    const patientProfile = shouldActivateNutrition ? await this.ensurePatientProfile(userId) : null
    const patientPlan = shouldActivateNutrition
      ? await this.ensureActivatedPatientPlan({
          patientProfileId: patientProfile.id,
          planName: plan.name,
          today,
        })
      : null
    const weeklyDiet = patientPlan ? await this.ensureWeeklyDiet(patientPlan.id) : null

    return { subscription, payment, invoice, patientProfile, patientPlan, weeklyDiet }
  },

  async ensurePatientProfile(userId) {
    const patientProfiles = await apiService.get(`${jsonServerBaseUrl}/patientProfiles`)
    const existingProfile = patientProfiles.find((profile) => profile.userId === userId)
    if (existingProfile) return existingProfile

    return apiService.post(`${jsonServerBaseUrl}/patientProfiles`, {
      userId,
      weightKg: 78,
      heightCm: 175,
      age: 32,
      biologicalSex: 'MALE',
      activityLevel: 'MODERATE',
      systolicPressure: 120,
      diastolicPressure: 80,
      basalGlucose: 90,
      bmi: 25.5,
      nutritionalGoal: 'LOSE_WEIGHT',
      dietaryRestrictions: [],
      restrictionsConfirmed: true,
      isComplete: true,
      assignedNutritionistId: 1,
    })
  },

  async ensureActivatedPatientPlan({ patientProfileId, planName, today }) {
    const patientPlans = await apiService.get(`${jsonServerBaseUrl}/patientPlans`)
    const existingPlan = patientPlans.find((candidate) => candidate.patientId === patientProfileId)
    const planPayload = {
      patientId: patientProfileId,
      nutritionistId: 1,
      name: 'Plan Nutricional — Semana 1',
      objective: 'bajar de peso',
      dailyCalories: planName === 'Premium' ? 1950 : 1850,
      proteinPercentage: 35,
      carbohydratePercentage: 45,
      fatPercentage: 20,
      status: 'ACTIVATED',
      activatedAt: existingPlan?.activatedAt ?? today,
      rejectedReason: null,
    }

    if (existingPlan) {
      return apiService.patch(`${jsonServerBaseUrl}/patientPlans/${existingPlan.id}`, planPayload)
    }

    return apiService.post(`${jsonServerBaseUrl}/patientPlans`, {
      ...planPayload,
      createdAt: today,
    })
  },

  async ensureWeeklyDiet(patientPlanId) {
    const weeklyDiets = await apiService.get(`${jsonServerBaseUrl}/weeklyDiets`)
    const existingDiet = weeklyDiets.find((diet) => diet.planId === patientPlanId)
    if (existingDiet) return existingDiet

    return apiService.post(`${jsonServerBaseUrl}/weeklyDiets`, {
      planId: patientPlanId,
      weekNumber: 1,
      days: createDefaultWeeklyDietDays(),
    })
  },
}
