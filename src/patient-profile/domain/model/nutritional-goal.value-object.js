import { DomainError } from '../../../shared/domain/domain-error'
import { t } from '../../../locales'

const allowedGoals = ['bajar-peso', 'mantener-peso', 'ganar-masa']

export class NutritionalGoal {
  constructor(value) {
    if (!allowedGoals.includes(value)) {
      throw new DomainError(t('stores.domain.invalidNutritionalGoal'), 'INVALID_NUTRITIONAL_GOAL')
    }

    this.value = value
  }
}
