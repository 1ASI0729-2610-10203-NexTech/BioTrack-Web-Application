import { DomainError } from '../../../shared/domain/domain-error'

function ensureEnum(value, allowedValues, code) {
  if (!allowedValues.includes(value)) {
    throw new DomainError('Valor de catalogo invalido.', code)
  }

  return value
}

export class ActivityLevel {
  constructor(value) {
    this.value = ensureEnum(value, ['sedentary', 'moderate', 'active'], 'INVALID_ACTIVITY_LEVEL')
  }
}

export class BiologicalSex {
  constructor(value) {
    this.value = ensureEnum(value, ['female', 'male', 'intersex', 'unspecified'], 'INVALID_BIOLOGICAL_SEX')
  }
}
