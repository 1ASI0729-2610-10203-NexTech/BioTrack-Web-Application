import { BaseEntity } from '../../../shared/domain/base-entity'
import { DomainError } from '../../../shared/domain/domain-error'

export function validateRuc(value) {
  return /^\d{11}$/.test(String(value ?? ''))
}

export class Ruc {
  constructor(value) {
    if (!validateRuc(value)) {
      throw new DomainError('RUC invalido.', 'INVALID_RUC')
    }

    this.value = value
  }
}

export class InvitationStatus {
  constructor(value = 'pending') {
    if (!['pending', 'accepted', 'expired'].includes(value)) {
      throw new DomainError('Estado de invitacion invalido.', 'INVALID_INVITATION_STATUS')
    }
    this.value = value
  }
}

export class CompanyStatus {
  constructor(value = 'active') {
    if (!['active', 'paused', 'archived'].includes(value)) {
      throw new DomainError('Estado de empresa invalido.', 'INVALID_COMPANY_STATUS')
    }
    this.value = value
  }
}

export class AnonymityThreshold {
  constructor(value) {
    if (!Number.isInteger(value) || value < 5) {
      throw new DomainError('El minimo de anonimato debe ser al menos 5.', 'INVALID_THRESHOLD')
    }
    this.value = value
  }
}

export class Company extends BaseEntity {
  constructor({ id, name, ruc, status, createdAt, updatedAt }) {
    super({ id, createdAt, updatedAt })
    this.name = name
    this.ruc = ruc instanceof Ruc ? ruc : new Ruc(ruc)
    this.status = status instanceof CompanyStatus ? status : new CompanyStatus(status)
  }
}

export class Collaborator extends BaseEntity {
  constructor({ id, companyId, displayName, invitationStatus, createdAt, updatedAt }) {
    super({ id, createdAt, updatedAt })
    this.companyId = companyId
    this.displayName = displayName
    this.invitationStatus =
      invitationStatus instanceof InvitationStatus
        ? invitationStatus
        : new InvitationStatus(invitationStatus)
  }
}

export class CorporateMetric extends BaseEntity {
  constructor({ id, companyId, sampleSize, threshold, averages, createdAt, updatedAt }) {
    super({ id, createdAt, updatedAt })
    this.companyId = companyId
    this.sampleSize = sampleSize
    this.threshold =
      threshold instanceof AnonymityThreshold ? threshold : new AnonymityThreshold(threshold)
    this.averages = averages
  }

  canBePublished() {
    return this.sampleSize >= this.threshold.value
  }

  toAdminView() {
    return this.canBePublished()
      ? { companyId: this.companyId, sampleSize: this.sampleSize, averages: this.averages }
      : { companyId: this.companyId, sampleSize: this.sampleSize, averages: null }
  }
}
