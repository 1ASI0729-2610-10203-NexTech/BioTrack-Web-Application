/**
 * Normalizes weights into chart coordinates for a simple SVG polyline.
 * @param {number[]} weights
 * @param {{ width: number, height: number, padding: number }} box
 * @param {{ yMin?: number, yMax?: number }} [domain]
 */
export function projectWeightsToPoints(weights, box, domain = {}) {
  if (!weights.length) return { points: [], min: 0, max: 0 }
  const dataMin = Math.min(...weights)
  const dataMax = Math.max(...weights)
  const min = domain.yMin != null ? Number(domain.yMin) : dataMin
  const max = domain.yMax != null ? Number(domain.yMax) : dataMax
  const span = max - min || 1
  const innerW = box.width - box.padding * 2
  const innerH = box.height - box.padding * 2
  const points = weights.map((value, index) => {
    const x = box.padding + (index / Math.max(weights.length - 1, 1)) * innerW
    const y = box.padding + innerH - ((value - min) / span) * innerH
    return { x, y, value }
  })
  return { points, min, max }
}

export function buildAxisTicks(min, max, steps = 3) {
  const low = Math.floor(min - 1)
  const high = Math.ceil(max + 1)
  const step = (high - low) / (steps - 1)
  return Array.from({ length: steps }, (_, index) => Math.round(high - index * step))
}
