import { DomainError } from '../../../shared/domain/domain-error'

const allowedGoals = ['bajar-peso', 'mantener-peso', 'ganar-masa']

export class NutritionalGoal {
  constructor(value) {
    if (!allowedGoals.includes(value)) {
      throw new DomainError('Objetivo nutricional invalido.', 'INVALID_NUTRITIONAL_GOAL')
    }

    this.value = value
  }
}
