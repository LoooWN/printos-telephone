// Calculateur libre (PrintOS 2.16) : le même calcul que src/core/pricing.ts de PrintOS (coût, prix conseillé, plancher),
// pour un poids et une durée tapés sur le téléphone : une version plus petite, un élément vendu seul… En centimes.

/** Même arrondi que PrintOS : le bruit du calcul à virgule (au-delà de six décimales) est retiré avant d'arrondir. */
const roundCents = (cents) => Math.round(Number(cents.toFixed(6)))

/** Filament (prix moyen du PLA), électricité, usure, emballage ; coût null si le prix du PLA est inconnu. */
export function cost(grams, minutes, c) {
  const lines = [
    { label: 'Filament', cents: c.filamentCentsPerGram === null ? null : roundCents(grams * c.filamentCentsPerGram) },
    { label: 'Électricité', cents: roundCents((minutes * c.printerWatts * c.electricityCentsPerKwh) / 60000) },
    { label: 'Usure de la machine', cents: roundCents((minutes * c.wearCentsPerHour) / 60) },
    { label: 'Emballage', cents: c.packagingCents },
  ]
  const totalCents = lines.some((l) => l.cents === null) ? null : lines.reduce((sum, l) => sum + l.cents, 0)
  return { lines, totalCents }
}

/** Coût × (1 + marge visée), arrondi à l'euro supérieur, en entiers comme PrintOS. */
export function suggestedPrice(costCents, c) {
  const scaled = costCents * (100 + c.targetMarginPercent)
  return (Math.floor(scaled / 10000) + (scaled % 10000 === 0 ? 0 : 1)) * 100
}

/** Le plus haut de coût + bénéfice minimum et coût + marge minimum, arrondi à l'euro supérieur. */
export function floorPrice(costCents, c) {
  const byMargin = Math.ceil((costCents * (100 + c.floorMinMarginPercent)) / 10000) * 100
  return Math.max(Math.ceil((costCents + c.floorMinProfitCents) / 100) * 100, byMargin)
}

/** Bénéfice et marge (bénéfice ÷ coût), comme la carte Prix de la fiche dans PrintOS. */
export function margin(priceCents, costCents) {
  const profitCents = priceCents - costCents
  return { profitCents, percent: costCents > 0 ? Math.round((profitCents * 100) / costCents) : null }
}

/** « 2,8 » ou « 2.8 h » (comme MakerWorld), « 2 h 48 », « 2h48 », « 2 h 5 min », « 45 min », « 2:48 » → minutes. */
export function parseDuration(text) {
  const t = String(text).trim().toLowerCase().replace(/\s+/g, ' ')
  let m
  let minutes
  if ((m = /^(\d+(?:[.,]\d+)?) ?h?$/.exec(t))) minutes = Number(m[1].replace(',', '.')) * 60
  else if ((m = /^(\d+) ?h ?(\d{1,2})? ?(?:min)?$/.exec(t)) || (m = /^(\d+):(\d{2})$/.exec(t))) {
    if (Number(m[2] ?? 0) > 59) return null
    minutes = Number(m[1]) * 60 + Number(m[2] ?? 0)
  } else if ((m = /^(\d+) ?min$/.exec(t))) minutes = Number(m[1])
  else return null
  const rounded = Math.round(Number(minutes.toFixed(6)))
  return rounded > 0 ? rounded : null
}

/** « 42 », « 42,5 », « 42.5 g » → grammes ; null si ce n'est pas un poids positif. */
export function parseGrams(text) {
  const m = /^(\d+(?:[.,]\d+)?) ?g?$/.exec(String(text).trim().toLowerCase())
  const grams = m ? Number(m[1].replace(',', '.')) : 0
  return grams > 0 ? grams : null
}

const NUMBERS = ['electricityCentsPerKwh', 'printerWatts', 'wearCentsPerHour', 'packagingCents', 'targetMarginPercent', 'floorMinProfitCents', 'floorMinMarginPercent']

/** Réglages venus du gist, gardés seulement complets ; null avant PrintOS 2.16 ou s'ils sont abîmés. */
export function readCosts(costs) {
  if (!costs || typeof costs !== 'object') return null
  const filament = costs.filamentCentsPerGram
  if (filament !== null && !(Number.isFinite(filament) && filament > 0)) return null
  if (!NUMBERS.every((key) => Number.isFinite(costs[key]) && costs[key] >= 0)) return null
  return Object.fromEntries([['filamentCentsPerGram', filament], ...NUMBERS.map((key) => [key, costs[key]])])
}
