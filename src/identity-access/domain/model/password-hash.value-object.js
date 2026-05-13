import { DomainError } from '../../../shared/domain/domain-error'

export class PasswordHash {
  constructor(value) {
    if (!value || String(value).length < 12) {
      throw new DomainError('El hash de contrasena no es valido.', 'INVALID_PASSWORD_HASH')
    }

    this.value = value
  }
}
