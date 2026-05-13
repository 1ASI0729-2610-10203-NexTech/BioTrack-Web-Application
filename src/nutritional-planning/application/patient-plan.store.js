import { defineStore } from 'pinia'
import { PatientPlan } from '../domain/model/patient-plan.entity'
import { WeeklyDiet } from '../domain/model/weekly-diet.entity'
import { PatientPlanStatus } from '../domain/model/plan-status.value-object'

const mealSet = [
  {
    type: 'desayuno',
    icon: '☀️',
    name: 'Avena con leche + platano',
    description: 'Fibra, energia sostenida y fruta fresca.',
    calories: 380,
  },
  {
    type: 'almuerzo',
    icon: '🍽️',
    name: 'Arroz integral + pollo + ensalada',
    description: 'Proteina magra con carbohidrato complejo.',
    calories: 620,
  },
  {
    type: 'merienda',
    icon: '🥤',
    name: 'Yogur griego + almendras',
    description: 'Snack saciante con proteina.',
    calories: 230,
  },
  {
    type: 'cena',
    icon: '🌙',
    name: 'Crema de verduras + pan integral',
    description: 'Cena ligera y reconfortante.',
    calories: 380,
  },
]

const weeklyDietMock = new WeeklyDiet({
  days: ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'].map(
    (name) => ({ name, meals: mealSet }),
  ),
})

export const usePatientPlanStore = defineStore('patient-plan', {
  state: () => ({
    currentPlan: null,
    planStatus: PatientPlanStatus.PROPOSED,
    weeklyDiet: weeklyDietMock,
    nutritionist: 'Dra. Ana Torres',
    loading: false,
    error: '',
    acceptedRecently: false,
  }),
  getters: {
    hasActivePlan(state) {
      return state.planStatus === PatientPlanStatus.ACTIVE
    },
    hasProposedPlan(state) {
      return state.planStatus === PatientPlanStatus.PROPOSED
    },
  },
  actions: {
    async fetchPatientPlan() {
      if (this.currentPlan) return this.currentPlan
      this.currentPlan = new PatientPlan({
        title: 'Plan Nutricional - Semana 1',
        nutritionist: 'Dra. Ana Torres',
        date: '23/04/2026',
        targetCalories: 1850,
        goal: 'Bajar de peso',
        macros: {
          proteins: 35,
          carbohydrates: 45,
          fats: 20,
        },
        status: this.planStatus,
      })
      return this.currentPlan
    },
    async acceptPlan() {
      this.loading = true
      await new Promise((resolve) => setTimeout(resolve, 500))
      await this.fetchPatientPlan()
      this.currentPlan.activate()
      this.planStatus = PatientPlanStatus.ACTIVE
      this.acceptedRecently = true
      this.loading = false
    },
    async rejectPlan() {
      await this.fetchPatientPlan()
      this.currentPlan.reject()
      this.planStatus = PatientPlanStatus.REJECTED
    },
    async getWeeklyDiet() {
      return this.weeklyDiet
    },
    resetPlanAcceptance() {
      this.acceptedRecently = false
    },
  },
})
