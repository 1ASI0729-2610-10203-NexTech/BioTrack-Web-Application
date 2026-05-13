import { BaseEntity } from '../../../shared/domain/base-entity'
import { DomainError } from '../../../shared/domain/domain-error'

export class Money {
  constructor({ amount, currency = 'PEN' }) {
    if (amount < 0) throw new DomainError('Monto invalido.', 'INVALID_MONEY')
    this.amount = amount
    this.currency = currency
  }
}

export class BillingPeriod {
  constructor(value) {
    if (!['monthly', 'annual'].includes(value)) {
      throw new DomainError('Periodo de facturacion invalido.', 'INVALID_BILLING_PERIOD')
    }
    this.value = value
  }
}

export class PaymentStatus {
  constructor(value = 'pending') {
    if (!['pending', 'paid', 'failed'].includes(value)) {
      throw new DomainError('Estado de pago invalido.', 'INVALID_PAYMENT_STATUS')
    }
    this.value = value
  }
}

export class SubscriptionStatus {
  constructor(value = 'active') {
    if (!['active', 'suspended', 'cancelled'].includes(value)) {
      throw new DomainError('Estado de suscripcion invalido.', 'INVALID_SUBSCRIPTION_STATUS')
    }
    this.value = value
  }
}

export class InvoiceNumber {
  constructor(value) {
    if (!/^INV-\d{6}$/.test(value)) {
      throw new DomainError('Numero de comprobante invalido.', 'INVALID_INVOICE_NUMBER')
    }
    this.value = value
  }
}

export class CardLastFourDigits {
  constructor(value) {
    if (!/^\d{4}$/.test(String(value ?? ''))) {
      throw new DomainError('Solo se permiten los ultimos 4 digitos.', 'INVALID_CARD_LAST_FOUR')
    }
    this.value = String(value)
  }
}

export class SubscriptionPlan extends BaseEntity {}

export class IndividualSubscription extends BaseEntity {
  constructor({ id, status }) {
    super({ id })
    this.status = status instanceof SubscriptionStatus ? status : new SubscriptionStatus(status)
  }
}

export class CorporateSubscription extends BaseEntity {
  constructor({ id, licensesTotal, licensesUsed, status }) {
    super({ id })
    if (licensesUsed > licensesTotal) {
      throw new DomainError('Licencias usadas supera licencias total.', 'INVALID_LICENSE_USAGE')
    }
    this.licensesTotal = licensesTotal
    this.licensesUsed = licensesUsed
    this.status = status instanceof SubscriptionStatus ? status : new SubscriptionStatus(status)
  }
}

export class Payment extends BaseEntity {
  constructor({ id, amount, status, cardLastFourDigits }) {
    super({ id })
    this.amount = amount instanceof Money ? amount : new Money(amount)
    this.status = status instanceof PaymentStatus ? status : new PaymentStatus(status)
    this.cardLastFourDigits =
      cardLastFourDigits instanceof CardLastFourDigits
        ? cardLastFourDigits
        : new CardLastFourDigits(cardLastFourDigits)
  }
}

export class Invoice extends BaseEntity {
  constructor({ id, invoiceNumber }) {
    super({ id })
    this.invoiceNumber =
      invoiceNumber instanceof InvoiceNumber ? invoiceNumber : new InvoiceNumber(invoiceNumber)
  }
}

export class LatePaymentNotice extends BaseEntity {}

export function suspendAfterRenewalFailure(subscription) {
  subscription.status = new SubscriptionStatus('suspended')
  return subscription
}

export function activateSubscription(subscription) {
  subscription.status = new SubscriptionStatus('active')
  return subscription
}
