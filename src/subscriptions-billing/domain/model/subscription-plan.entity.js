export class SubscriptionPlan {
  constructor({
    id,
    code,
    name,
    nameKey,
    price,
    description,
    descriptionKey,
    featured = false,
    contactOnly = false,
    internal = false,
    features = [],
    disabledFeatures = [],
  }) {
    this.id = id
    this.code = code
    this.name = name
    this.nameKey = nameKey
    this.price = price
    this.description = description
    this.descriptionKey = descriptionKey
    this.featured = featured
    this.contactOnly = contactOnly
    this.internal = internal
    this.features = features
    this.disabledFeatures = disabledFeatures
  }
}
