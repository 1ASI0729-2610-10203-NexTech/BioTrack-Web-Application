export class AdherencePercentage {
  constructor(value) {
    this.value = Math.min(Math.max(Number(value) || 0, 0), 100)
  }
}
