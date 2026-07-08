import { NutritionalPlan } from '../domain/model/nutritional-plan.entity'

export const NutritionalPlanAssembler = {
  fromApi(payload) {
    return new NutritionalPlan({
      id: payload.id,
      name: payload.name,
      calorieTarget: payload.calorieTarget,
      proteinGrams: payload.proteinGrams,
      carbsGrams: payload.carbsGrams,
      fatGrams: payload.fatGrams,
      status: payload.status,
      nutritionistId: payload.nutritionistId,
      createdAt: payload.createdAt,
      updatedAt: payload.updatedAt,
    })
  },
}
