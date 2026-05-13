import { DomainError } from '../../../shared/domain/domain-error'

const allowedActivityLevels = ['sedentaria', 'moderada', 'activa']

export class ActivityLevel {
  constructor(value) {
    if (!allowedActivityLevels.includes(value)) {
      throw new DomainError('Nivel de actividad invalido.', 'INVALID_ACTIVITY_LEVEL')
    }

    this.value = value
  }
}
