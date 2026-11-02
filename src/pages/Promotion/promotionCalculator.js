// Чистые функции расчёта: не зависят от React и отдельно проверяются тестами.
export const RECOMMENDATION_LIFETIME_MS = 72 * 60 * 60 * 1000

export function getRecommendationStatus({ degree, issuedAt, approved, now }) {
  if (degree === 'none') return 'none'
  if (!approved) return 'unapproved'
  const issuedTime = new Date(issuedAt).getTime()
  if (!issuedAt || !Number.isFinite(issuedTime)) return 'missing-date'
  if (issuedTime > now) return 'future'
  if (now - issuedTime >= RECOMMENDATION_LIFETIME_MS) return 'expired'
  return 'valid'
}

export function getRecommendationAllowance(total, degree) {
  if (degree === '1') return total
  if (degree === '2') {
    // Округление вниз подтверждено владельцем: из 5 заданий закрываются 2.
    return Math.floor(total / 2)
  }
  if (degree === '3') return Math.min(1, total)
  return 0
}

export function calculatePromotion({
  statuses,
  allowance,
  recommendationValid,
  reprimand,
}) {
  const completed = statuses.filter((status) => status === 'done').length
  const selectedForRecommendation = statuses.filter(
    (status) => status === 'waived',
  ).length
  const covered = recommendationValid
    ? Math.min(selectedForRecommendation, allowance)
    : 0
  const remaining = statuses.length - completed - covered

  return {
    completed,
    covered,
    remaining,
    overLimit: recommendationValid && selectedForRecommendation > allowance,
    percent: statuses.length
      ? Math.round(((completed + covered) / statuses.length) * 100)
      : 0,
    ready:
      remaining === 0 && !reprimand && selectedForRecommendation <= allowance,
  }
}
