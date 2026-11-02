import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  calculatePromotion,
  getRecommendationAllowance,
  getRecommendationStatus,
  RECOMMENDATION_LIFETIME_MS,
} from './promotionCalculator.js'

test('recommendation degrees cover one rank, half the criteria, or one criterion', () => {
  assert.equal(getRecommendationAllowance(5, '1'), 5)
  assert.equal(getRecommendationAllowance(4, '2'), 2)
  assert.equal(getRecommendationAllowance(5, '2'), 2)
  assert.equal(getRecommendationAllowance(3, '2'), 1)
  assert.equal(getRecommendationAllowance(5, '3'), 1)
  assert.equal(getRecommendationAllowance(5, 'none'), 0)
})

test('recommendation requires approval, a real issue date and age strictly below 72 hours', () => {
  const now = Date.parse('2026-11-02T12:00:00Z')
  const input = {
    degree: '2',
    approved: true,
    issuedAt: '2026-11-01T12:00:00Z',
    now,
  }
  assert.equal(getRecommendationStatus(input), 'valid')
  assert.equal(
    getRecommendationStatus({ ...input, approved: false }),
    'unapproved',
  )
  assert.equal(
    getRecommendationStatus({ ...input, issuedAt: '' }),
    'missing-date',
  )
  assert.equal(
    getRecommendationStatus({ ...input, issuedAt: '2026-11-03T12:00:00Z' }),
    'future',
  )
  assert.equal(
    getRecommendationStatus({
      ...input,
      issuedAt: new Date(now - RECOMMENDATION_LIFETIME_MS).toISOString(),
    }),
    'expired',
  )
})

test('completed and waived criteria do not overlap; expiry restores outstanding requirements', () => {
  const input = {
    statuses: ['done', 'waived', 'open'],
    allowance: 1,
    recommendationValid: true,
    reprimand: false,
  }
  assert.equal(calculatePromotion(input).remaining, 1)
  assert.equal(
    calculatePromotion({ ...input, recommendationValid: false }).remaining,
    2,
  )
  assert.equal(
    calculatePromotion({ ...input, statuses: ['done', 'waived'] }).ready,
    true,
  )
  assert.equal(
    calculatePromotion({
      ...input,
      statuses: ['done', 'waived'],
      reprimand: true,
    }).ready,
    false,
  )
  assert.equal(
    calculatePromotion({ ...input, statuses: ['waived', 'waived'] }).remaining,
    1,
  )
  assert.equal(
    calculatePromotion({ ...input, statuses: ['waived', 'waived'] }).overLimit,
    true,
  )
})

test('source migration preserves all twenty transitions and their criteria', () => {
  const steps = JSON.parse(
    readFileSync(
      new URL('../../data/promotion-steps.json', import.meta.url),
      'utf8',
    ),
  )
  assert.equal(steps.length, 20)
  assert.deepEqual(
    steps.map((step) => step.tasks.length),
    [4, 3, 4, 4, 5, 5, 4, 4, 5, 5, 3, 4, 3, 4, 4, 5, 5, 4, 5, 6],
  )
  assert.match(steps[4].tasks[3], /10 минут/)
  assert.match(steps[19].tasks[5], /крышу/)
})
