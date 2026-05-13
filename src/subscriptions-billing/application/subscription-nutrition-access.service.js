import { subscriptionsBillingApiService } from '../infrastructure/subscriptions-billing-api.service'

export async function syncNutritionAccessForUser(userId) {
  if (!userId) return null
  return subscriptionsBillingApiService.ensureNutritionAccessForEligibleUser(userId)
}
