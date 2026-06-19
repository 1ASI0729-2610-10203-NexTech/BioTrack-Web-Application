import { DomainError } from '../../../shared/domain/domain-error'

export class Email {
  constructor(value) {
    const normalized = String(value ?? '').trim().toLowerCase()

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      throw new DomainError('Correo electronico invalido.', 'INVALID_EMAIL')
    }

    this.value = normalized
  }
}
