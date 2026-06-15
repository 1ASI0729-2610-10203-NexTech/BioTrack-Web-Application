import { BaseEntity } from '../../../shared/domain/base-entity'

export class VerificationToken extends BaseEntity {
  constructor({ id, token, userId, issuedAt = new Date(), expiresAt, createdAt, updatedAt }) {
    super({ id, createdAt, updatedAt })
    this.token = token
    this.userId = userId
    this.issuedAt = new Date(issuedAt)
    this.expiresAt = expiresAt
      ? new Date(expiresAt)
      : new Date(this.issuedAt.getTime() + 24 * 60 * 60 * 1000)
  }

  isExpired(referenceDate = new Date()) {
    return referenceDate >= this.expiresAt
  }
}
