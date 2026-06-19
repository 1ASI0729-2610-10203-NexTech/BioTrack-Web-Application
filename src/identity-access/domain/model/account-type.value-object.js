import { DomainError } from '../../../shared/domain/domain-error'

export const AccountTypeValues = Object.freeze({
  PATIENT: 'patient',
  NUTRITIONIST: 'nutritionist',
  CORPORATE_ADMIN: 'corporate-admin',
})

export class AccountType {
  constructor(value) {
    if (!Object.values(AccountTypeValues).includes(value)) {
      throw new DomainError('Tipo de cuenta invalido.', 'INVALID_ACCOUNT_TYPE')
    }

    this.value = value
  }
}
