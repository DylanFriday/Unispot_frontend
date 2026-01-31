export const toCents = (baht: number | string): number => {
  if (typeof baht === 'string') {
    if (baht.trim() === '') return 0
  }
  const value = Number(baht)
  if (!Number.isFinite(value)) return 0
  return Math.round(value * 100)
}

export const fromCents = (cents: number): number => {
  if (!Number.isFinite(cents)) return 0
  return cents / 100
}

export const formatBahtFromCents = (cents: number): string => {
  return fromCents(cents).toFixed(2)
}
