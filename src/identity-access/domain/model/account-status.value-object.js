import { DomainError } from '../../../shared/domain/domain-error'

export const AccountStatusValues = Object.freeze({
  PENDING: 'pending',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
})

export class AccountStatus {
  constructor(value = AccountStatusValues.PENDING) {
    if (!Object.values(AccountStatusValues).includes(value)) {
      throw new DomainError('Estado de cuenta invalido.', 'INVALID_ACCOUNT_STATUS')
    }

    this.value = value
  }
}
