// Vérification du calculateur libre : node --test
// Les chiffres attendus viennent de src/core/pricing.ts de PrintOS (manufacturingCost, suggestedPrice, floorPrice),
// avec les réglages de Logan du 9 novembre 2026 et deux bobines PLA à 19,99 € et 25 € le kilo.
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { cost, floorPrice, margin, parseDuration, parseGrams, readCosts, suggestedPrice } from './calcul.js'

const reglages = {
  filamentCentsPerGram: (1.999 + 2.5) / 2,
  electricityCentsPerKwh: 49,
  printerWatts: 120,
  wearCentsPerHour: 15,
  packagingCents: 100,
  targetMarginPercent: 150,
  floorMinProfitCents: 300,
  floorMinMarginPercent: 30,
}

const cas = [
  // grammes, minutes, [filament, électricité, usure, emballage], coût, conseillé, plancher
  [42, 125, [94, 12, 31, 100], 237, 600, 600],
  [180, 168, [405, 16, 42, 100], 563, 1500, 900],
  [7.5, 20, [17, 2, 5, 100], 124, 400, 500],
  [600, 691, [1350, 68, 173, 100], 1691, 4300, 2200],
]

for (const [grams, minutes, lignes, total, conseille, plancher] of cas) {
  test(`${grams} g, ${minutes} min : mêmes chiffres que PrintOS`, () => {
    const c = cost(grams, minutes, reglages)
    assert.deepEqual(
      c.lines.map((l) => l.cents),
      lignes,
    )
    assert.equal(c.totalCents, total)
    assert.equal(suggestedPrice(total, reglages), conseille)
    assert.equal(floorPrice(total, reglages), plancher)
  })
}

test('sans prix du PLA : filament inconnu, coût inconnu', () => {
  const c = cost(42, 125, { ...reglages, filamentCentsPerGram: null })
  assert.equal(c.lines[0].cents, null)
  assert.equal(c.totalCents, null)
})

test('bénéfice et marge comme sur la fiche de PrintOS (bénéfice ÷ coût)', () => {
  assert.deepEqual(margin(1500, 563), { profitCents: 937, percent: 166 })
  assert.deepEqual(margin(500, 563), { profitCents: -63, percent: -11 })
})

test('durée : comme MakerWorld (2,8 h) ou en heures et minutes', () => {
  assert.equal(parseDuration('2,8'), 168)
  assert.equal(parseDuration('2.8 h'), 168)
  assert.equal(parseDuration('2,8h'), 168)
  assert.equal(parseDuration('12.3 h'), 738)
  assert.equal(parseDuration('2 h 48'), 168)
  assert.equal(parseDuration('2h48'), 168)
  assert.equal(parseDuration('2 h 5 min'), 125)
  assert.equal(parseDuration('2 h'), 120)
  assert.equal(parseDuration('45 min'), 45)
  assert.equal(parseDuration('2:48'), 168)
  assert.equal(parseDuration(''), null)
  assert.equal(parseDuration('0'), null)
  assert.equal(parseDuration('deux heures'), null)
  assert.equal(parseDuration('2 h 75'), null)
})

test('poids : grammes positifs, virgule ou point', () => {
  assert.equal(parseGrams('42'), 42)
  assert.equal(parseGrams('42,5'), 42.5)
  assert.equal(parseGrams('42.5 g'), 42.5)
  assert.equal(parseGrams('0'), null)
  assert.equal(parseGrams('abc'), null)
})

test('réglages venus du gist : gardés seulement complets', () => {
  assert.deepEqual(readCosts(reglages), reglages)
  assert.deepEqual(readCosts({ ...reglages, filamentCentsPerGram: null }), { ...reglages, filamentCentsPerGram: null })
  assert.equal(readCosts(undefined), null)
  assert.equal(readCosts({ ...reglages, packagingCents: '100' }), null)
  assert.equal(readCosts({ ...reglages, printerWatts: undefined }), null)
})
