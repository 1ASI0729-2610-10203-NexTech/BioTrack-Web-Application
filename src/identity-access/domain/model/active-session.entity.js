import { BaseEntity } from '../../../shared/domain/base-entity'
import { DomainError } from '../../../shared/domain/domain-error'

export class ActiveSession extends BaseEntity {
  constructor({ id, userId, jwtJti, issuedAt = new Date(), expiresAt, createdAt, updatedAt }) {
    super({ id, createdAt, updatedAt })

    if (!jwtJti) {
      throw new DomainError('La sesion debe conservar jwt_jti.', 'MISSING_JWT_JTI')
    }

    this.userId = userId
    this.jwtJti = jwtJti
    this.issuedAt = new Date(issuedAt)
    this.expiresAt = expiresAt ? new Date(expiresAt) : null
  }
}
