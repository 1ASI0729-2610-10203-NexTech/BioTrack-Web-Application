import { createRouter, createWebHistory } from 'vue-router'

// Rutas se agregan al hacer merge de cada feat/* branch:
// feat/identity-access       → login, register, auth guard
// feat/patient-profile       → /patient-profile/**
// feat/nutritional-planning  → /dashboard, /nutritional-plan, /nutritionist-**
// feat/progress-tracking     → /progress-tracking/**, /food-log
// feat/subscriptions-billing → /subscriptions-billing
// feat/corporate-management  → /corporate-**

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [],
})

export default router
