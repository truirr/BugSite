import { useEffect, useState } from 'react'
import { recommendations } from '../../../data/promotion'
import {
  calculatePromotion,
  getRecommendationAllowance,
  getRecommendationStatus,
} from '../promotionCalculator'

const statusMessages = {
  unapproved:
    'Рекомендацию сначала должны утвердить в профильном канале Discord.',
  'missing-date':
    'Укажи время выдачи, чтобы проверить срок действия рекомендации.',
  future: 'Время выдачи не может быть в будущем.',
  expired: 'Прошло 72 часа: эта рекомендация больше не учитывается.',
}

export default function PromotionCalculator({ step }) {
  const [statuses, setStatuses] = useState(() => step.tasks.map(() => 'open'))
  const [degree, setDegree] = useState('none')
  const [issuedAt, setIssuedAt] = useState('')
  const [approved, setApproved] = useState(false)
  const [reprimand, setReprimand] = useState(false)
  const [now, setNow] = useState(Date.now)
  const isAdmission = step.from === 'Ученика'

  // Обновляем срок действия даже если пользователь оставил страницу открытой.
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30000)
    return () => window.clearInterval(timer)
  }, [])

  const recommendationStatus = getRecommendationStatus({
    degree,
    issuedAt,
    approved,
    now,
  })
  const recommendationValid = !isAdmission && recommendationStatus === 'valid'
  const allowance = getRecommendationAllowance(step.tasks.length, degree)
  const result = calculatePromotion({
    statuses,
    allowance,
    recommendationValid,
    reprimand,
  })
  const selectedForRecommendation = statuses.filter(
    (status) => status === 'waived',
  ).length

  function changeStatus(index, value) {
    setStatuses((previous) =>
      previous.map((status, taskIndex) =>
        taskIndex === index ? value : status,
      ),
    )
  }

  function changeDegree(value) {
    setDegree(value)
    // При смене степени сбрасываем только пропуски, выполненные задания остаются.
    setStatuses((previous) =>
      previous.map((status) => (status === 'waived' ? 'open' : status)),
    )
  }

  function useCurrentIssueTime() {
    const currentTime = new Date()
    const localTime = new Date(
      currentTime.getTime() - currentTime.getTimezoneOffset() * 60000,
    )
    setIssuedAt(localTime.toISOString().slice(0, 16))
    setNow(currentTime.getTime())
  }

  return (
    <div className="promotion-calculator" id="promotion-calculator">
      <div className="promotion-calculator__form">
        <div className="promotion__section-heading">
          <div>
            <p className="page__eyebrow">Твой следующий шаг</p>
            <h2>
              {step.from} <span>→</span> {step.to}
            </h2>
          </div>
          <span className="promotion__badge">
            Критерии: {step.tasks.length}
          </span>
        </div>

        <p className="promotion__muted">
          Отметь выполненные пункты целиком. Количество действий, демонов и
          минут внутри каждого пункта указано в его описании.
        </p>

        <ol className="promotion-checklist">
          {step.tasks.map((task, index) => (
            <li
              key={`${index}-${task}`}
              className={`promotion-checklist__item promotion-checklist__item--${statuses[index]}`}
            >
              <span className="promotion-checklist__number">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="promotion-checklist__body">
                <p>{task}</p>
                <div className="promotion-checklist__actions">
                  <button
                    type="button"
                    aria-pressed={statuses[index] === 'done'}
                    onClick={() =>
                      changeStatus(
                        index,
                        statuses[index] === 'done' ? 'open' : 'done',
                      )
                    }
                  >
                    {statuses[index] === 'done'
                      ? '✓ Выполнено'
                      : 'Отметить выполненным'}
                  </button>
                  {!isAdmission && degree !== 'none' && (
                    <button
                      type="button"
                      aria-pressed={statuses[index] === 'waived'}
                      disabled={
                        !recommendationValid ||
                        (statuses[index] !== 'waived' &&
                          selectedForRecommendation >= allowance)
                      }
                      onClick={() =>
                        changeStatus(
                          index,
                          statuses[index] === 'waived' ? 'open' : 'waived',
                        )
                      }
                    >
                      {statuses[index] === 'waived'
                        ? '✦ По рекомендации'
                        : 'Закрыть рекомендацией'}
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <aside
        className="promotion-calculator__summary"
        aria-label="Расчёт повышения"
      >
        <p className="page__eyebrow">Калькулятор</p>
        <h3>До следующего ранга</h3>
        <label className="promotion__field">
          Одна рекомендация
          <select
            value={degree}
            disabled={isAdmission}
            onChange={(event) => changeDegree(event.target.value)}
          >
            <option value="none">Без рекомендации</option>
            {recommendations.map((item) => (
              <option key={item.degree} value={item.degree}>
                {item.title} — {item.benefit}
              </option>
            ))}
          </select>
        </label>

        {isAdmission && (
          <p className="promotion__muted">
            Финальный отбор — вступление в организацию. Правило повышения на
            ранг не применяется к нему автоматически.
          </p>
        )}

        {degree !== 'none' && (
          <>
            <label className="promotion__field">
              Когда выдана (твоё местное время)
              <input
                type="datetime-local"
                value={issuedAt}
                onChange={(event) => {
                  setIssuedAt(event.target.value)
                  setNow(Date.now())
                }}
              />
            </label>
            <button
              className="promotion__reset"
              type="button"
              onClick={useCurrentIssueTime}
            >
              Выдана прямо сейчас
            </button>
            <label className="promotion__checkbox">
              <input
                type="checkbox"
                checked={approved}
                onChange={(event) => setApproved(event.target.checked)}
              />
              Утверждена в Discord
            </label>
            {degree === '2' && (
              <p className="promotion__muted">
                Половина заданий округляется вниз: например, 2 из 5.
              </p>
            )}
            <p className="promotion-calculator__allowance">
              Одна рекомендация закрывает до{' '}
              <strong>
                {allowance} из {step.tasks.length}
              </strong>{' '}
              критериев.
            </p>
            {statusMessages[recommendationStatus] && (
              <p className="promotion__warning" role="status">
                {statusMessages[recommendationStatus]}
              </p>
            )}
            {recommendationValid && (
              <button
                type="button"
                className="promotion__button"
                onClick={() => {
                  setStatuses((previous) => {
                    let available = allowance
                    return previous.map((status) => {
                      if (status === 'done') return status
                      return available-- > 0 ? 'waived' : 'open'
                    })
                  })
                }}
              >
                Применить к невыполненным
              </button>
            )}
          </>
        )}

        <label className="promotion__checkbox">
          <input
            type="checkbox"
            checked={reprimand}
            onChange={(event) => setReprimand(event.target.checked)}
          />
          Есть действующий выговор
        </label>

        <div className="promotion-calculator__result" aria-live="polite">
          <div className="promotion-calculator__remaining">
            <strong>{result.remaining}</strong>
            <span>осталось закрыть</span>
          </div>
          <div
            className="promotion-calculator__progress"
            role="progressbar"
            aria-label="Закрытые критерии"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={result.percent}
          >
            <span style={{ width: `${result.percent}%` }} />
          </div>
          <dl>
            <div>
              <dt>Выполнено</dt>
              <dd>{result.completed}</dd>
            </div>
            <div>
              <dt>По рекомендации</dt>
              <dd>{result.covered}</dd>
            </div>
          </dl>
          {reprimand ? (
            <p className="promotion__warning">
              Повышение заблокировано: сначала нужно снять выговор (п. 7.6.3).
            </p>
          ) : result.ready ? (
            <p className="promotion__success">
              Критерии закрыты. Можно передать отчёт на проверку руководству.
            </p>
          ) : (
            <p className="promotion__muted">
              Закрой оставшиеся пункты и подготовь отчёт.
            </p>
          )}
        </div>
        <p className="promotion__muted">
          Это планировщик, а не автоматическое повышение. Решение принимает
          руководство. При смене ранга отметки сбрасываются.
        </p>
        <button
          className="promotion__reset"
          type="button"
          onClick={() => {
            setStatuses(step.tasks.map(() => 'open'))
            setDegree('none')
            setIssuedAt('')
            setApproved(false)
            setReprimand(false)
          }}
        >
          Сбросить расчёт
        </button>
      </aside>
    </div>
  )
}
