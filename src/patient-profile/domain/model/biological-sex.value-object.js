import { DomainError } from '../../../shared/domain/domain-error'

const allowedSexes = ['masculino', 'femenino', 'otro', 'prefiero-no-decir']

export class BiologicalSex {
  constructor(value) {
    if (!allowedSexes.includes(value)) {
      throw new DomainError('Sexo biologico invalido.', 'INVALID_BIOLOGICAL_SEX')
    }

    this.value = value
  }
}
