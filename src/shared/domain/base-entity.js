export class BaseEntity {
  constructor({ id, createdAt = new Date(), updatedAt = new Date() } = {}) {
    this.id = id ?? crypto.randomUUID()
    this.createdAt = new Date(createdAt)
    this.updatedAt = new Date(updatedAt)
  }

  touch() {
    this.updatedAt = new Date()
  }
}
