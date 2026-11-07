// Règle du calculateur de PrintOS (version 2.14), en centimes : accepter dès le prix plancher, sinon contre-proposer.

const euroUp = (cents) => Math.ceil(cents / 100) * 100

/**
 * Offre ≥ plancher (ou ≥ prix affiché) : « accepte ». Prix affiché déjà sous le plancher : « tenir » ce prix. Sinon
 * « contre » : le milieu entre l'offre et le prix affiché, arrondi à l'euro supérieur, jamais sous le plancher.
 */
export function verdict(offerCents, priceCents, floorCents) {
  if (offerCents >= floorCents || offerCents >= priceCents) return { kind: 'accepte' }
  if (floorCents >= priceCents) return { kind: 'tenir', priceCents }
  const counterCents = Math.min(priceCents, Math.max(floorCents, euroUp((offerCents + priceCents) / 2)))
  return { kind: 'contre', counterCents }
}

/** « 12 », « 12,5 », « 12.50 € » → centimes ; null si ce n'est pas un montant positif. */
export function parseEuros(text) {
  const clean = String(text).replace(/€/g, '').trim().replace(',', '.')
  if (!/^\d+(\.\d{1,2})?$/.test(clean)) return null
  return Math.round(Number(clean) * 100)
}
