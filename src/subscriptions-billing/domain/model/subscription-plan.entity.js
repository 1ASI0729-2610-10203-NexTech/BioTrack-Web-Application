export class SubscriptionPlan {
  constructor({ id, name, price, description, featured = false }) {
    this.id = id
    this.name = name
    this.price = price
    this.description = description
    this.featured = featured
  }
}
