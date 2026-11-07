// Vérification de la règle du calculateur : node --test
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parseEuros, verdict } from './verdict.js'

test('prix 15 €, plancher 9 € : accepte dès le plancher', () => {
  assert.deepEqual(verdict(1000, 1500, 900), { kind: 'accepte' })
  assert.deepEqual(verdict(900, 1500, 900), { kind: 'accepte' })
})

test('prix 15 €, plancher 9 € : sous le plancher, contre-proposition au milieu arrondi, jamais sous le plancher', () => {
  assert.deepEqual(verdict(600, 1500, 900), { kind: 'contre', counterCents: 1100 }) // milieu 10,50 € → 11 €
  assert.deepEqual(verdict(100, 1500, 900), { kind: 'contre', counterCents: 900 }) // milieu 8 € → le plancher
})

test('prix affiché déjà sous le plancher : accepte au prix affiché, sinon tiens ce prix', () => {
  assert.deepEqual(verdict(800, 800, 900), { kind: 'accepte' })
  assert.deepEqual(verdict(700, 800, 900), { kind: 'tenir', priceCents: 800 })
})

test('lit une offre tapée en euros, virgule ou point', () => {
  assert.equal(parseEuros('12'), 1200)
  assert.equal(parseEuros(' 12,5 '), 1250)
  assert.equal(parseEuros('12.50 €'), 1250)
  assert.equal(parseEuros(''), null)
  assert.equal(parseEuros('douze'), null)
  assert.equal(parseEuros('-3'), null)
})
