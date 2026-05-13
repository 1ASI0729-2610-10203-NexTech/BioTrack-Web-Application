import { BaseEntity } from '../../../shared/domain/base-entity'
import { AccountStatus } from './account-status.value-object'
import { AccountType } from './account-type.value-object'
import { Email } from './email.value-object'
import { PasswordHash } from './password-hash.value-object'

export class User extends BaseEntity {
  constructor({ id, email, passwordHash, accountType, accountStatus, createdAt, updatedAt }) {
    super({ id, createdAt, updatedAt })
    this.email = email instanceof Email ? email : new Email(email)
    this.passwordHash =
      passwordHash instanceof PasswordHash ? passwordHash : new PasswordHash(passwordHash)
    this.accountType =
      accountType instanceof AccountType ? accountType : new AccountType(accountType)
    this.accountStatus =
      accountStatus instanceof AccountStatus ? accountStatus : new AccountStatus(accountStatus)
  }
}
