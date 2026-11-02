import { useEffect, useRef, useState } from 'react'
import { api } from '../../lib/api'
import useContent from '../../lib/useContent'
import './Tests.css'
import './TestsCatalog.css'

export default function Tests() {
  const { content, error: loadError } = useContent()
  const [selected, setSelected] = useState(null)
  const [participant, setParticipant] = useState({ fullName: '', position: '' })
  const [attempt, setAttempt] = useState(null)
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const requestVersion = useRef(0)
  const modalRef = useRef(null)
  const triggerRef = useRef(null)
  const close = () => {
    if (busy) return
    requestVersion.current++
    setSelected(null)
    triggerRef.current?.focus()
  }
  useEffect(() => {
    if (!selected) return
    document.body.classList.add('modal-open')
    modalRef.current?.focus()
    const key = (e) => {
      if (e.key === 'Escape' && !busy) {
        requestVersion.current++
        setSelected(null)
        triggerRef.current?.focus()
      }
      if (e.key === 'Tab') {
        const focusable = modalRef.current?.querySelectorAll(
          'button:not(:disabled), input, [tabindex="0"]',
        )
        const first = focusable?.[0],
          last = focusable?.[focusable.length - 1]
        if (
          e.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === modalRef.current)
        ) {
          e.preventDefault()
          last?.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first?.focus()
        }
      }
    }
    window.addEventListener('keydown', key)
    return () => {
      document.body.classList.remove('modal-open')
      window.removeEventListener('keydown', key)
    }
  }, [selected, busy])
  function open(test, event) {
    triggerRef.current = event.currentTarget
    requestVersion.current++
    setSelected(test)
    setParticipant({ fullName: '', position: '' })
    setAttempt(null)
    setAnswers({})
    setResult(null)
    setError('')
  }
  async function start() {
    setBusy(true)
    setError('')
    const version = requestVersion.current
    try {
      const data = await api('/api/test-start', {
        method: 'POST',
        body: JSON.stringify({ testId: selected.id, ...participant }),
      })
      if (version === requestVersion.current) setAttempt(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }
  async function finish() {
    setBusy(true)
    setError('')
    try {
      setResult(
        await api('/api/test-result', {
          method: 'POST',
          body: JSON.stringify({
            attemptId: attempt.attemptId,
            answers: attempt.questions.map((_, i) => answers[i]),
          }),
        }),
      )
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }
  const tests = content?.tests || []
  const list = tests.length
    ? [
        ...tests,
        {
          id: 'combined',
          title: 'Комбинированный тест',
          icon: '混',
          description: 'Случайные вопросы из всех разделов.',
          count: content.combinedCount,
        },
      ]
    : []
  const answered = Object.keys(answers).length
  return (
    <section className="tests page">
      <div className="page__container tests__container">
        <p className="page__eyebrow">Knowledge Check</p>
        <h1 className="tests__title">Проверь свои знания</h1>
        <p className="tests__lead">
          Выбери тему и пройди проверку в своём темпе. В конце ты увидишь
          результат, а команда получит его в Discord.
        </p>
        {loadError && <p role="alert">{loadError}</p>}
        {!content && !loadError && <p role="status">Загружаем тесты…</p>}
        {content && !tests.length && <p>Тесты скоро появятся.</p>}
        {list.length > 0 && (
          <div className="tests__list-heading">
            <span>Выбери свой раздел</span>
            <span>{String(list.length).padStart(2, '0')} тестов</span>
          </div>
        )}
        <div className="tests__grid">
          {list.map((test, i) => (
            <button
              className={`tests__card ${test.id === 'combined' ? 'tests__card--combined' : ''}`}
              key={test.id}
              onClick={(e) => open(test, e)}
              style={{ '--delay': `${i * 0.06}s` }}
            >
              <span className="tests__number" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="tests__icon" aria-hidden="true">
                {test.icon}
              </span>
              <span className="tests__card-content">
                <strong>{test.title}</strong>
                <small>{test.description}</small>
              </span>
              <span className="tests__card-meta">
                <span className="tests__count">{test.count} вопросов</span>
                <span className="tests__start" aria-hidden="true">
                  Пройти тест <span>↗</span>
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
      {selected && (
        <div className="tests-modal" onMouseDown={close}>
          <div
            className="tests-modal__content"
            role="dialog"
            aria-modal="true"
            aria-labelledby="quiz-title"
            tabIndex={-1}
            ref={modalRef}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              className="tests-modal__close"
              disabled={busy}
              onClick={close}
              aria-label="Закрыть тест"
            >
              ×
            </button>
            <h2 id="quiz-title">{selected.title}</h2>
            {error && (
              <p
                role="alert"
                className="tests__send-status tests__send-status--error"
              >
                {error}
              </p>
            )}
            {!attempt && (
              <div className="tests-modal__start">
                <p className="tests-modal__description">
                  {selected.description}
                </p>
                <div className="tests-modal__form">
                  <label>
                    Имя и фамилия
                    <input
                      value={participant.fullName}
                      maxLength={80}
                      onChange={(e) =>
                        setParticipant({
                          ...participant,
                          fullName: e.target.value,
                        })
                      }
                    />
                  </label>
                  <label>
                    Должность
                    <input
                      value={participant.position}
                      maxLength={80}
                      onChange={(e) =>
                        setParticipant({
                          ...participant,
                          position: e.target.value,
                        })
                      }
                    />
                  </label>
                </div>
                <button
                  className="tests-modal__button"
                  onClick={start}
                  disabled={
                    busy ||
                    !participant.fullName.trim() ||
                    !participant.position.trim()
                  }
                >
                  {busy ? 'Подготавливаем вопросы…' : 'Начать тест'}
                </button>
              </div>
            )}
            {attempt && !result && (
              <div className="tests-modal__quiz">
                <div className="tests-modal__top">
                  <p>{participant.fullName}</p>
                  <span>
                    {answered}/{attempt.questions.length}
                  </span>
                </div>
                <div className="tests-modal__questions">
                  {attempt.questions.map((q, qi) => (
                    <article className="tests-modal__question" key={qi}>
                      <div className="tests-modal__question-head">
                        <span>{String(qi + 1).padStart(2, '0')}</span>
                      </div>
                      <h3>{q.question}</h3>
                      <div className="tests-modal__options">
                        {q.options.map((option, oi) => (
                          <button
                            key={oi}
                            disabled={busy}
                            aria-pressed={answers[qi] === oi}
                            className={`tests-modal__option ${answers[qi] === oi ? 'tests-modal__option--active' : ''}`}
                            onClick={() =>
                              setAnswers((a) => ({ ...a, [qi]: oi }))
                            }
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
                <button
                  className="tests-modal__button"
                  disabled={busy || answered !== attempt.questions.length}
                  onClick={finish}
                >
                  {busy ? 'Проверяем и отправляем…' : 'Завершить тест'}
                </button>
              </div>
            )}
            {result && (
              <div
                className={`tests__result tests__result--${result.percent >= 90 ? 'green' : result.percent >= 50 ? 'yellow' : 'red'}`}
              >
                <span className="tests__result-percent">{result.percent}%</span>
                <h2>
                  {result.percent >= 90
                    ? 'Отличный результат'
                    : result.percent >= 50
                      ? 'Средний результат'
                      : 'Нужно повторить материал'}
                </h2>
                <p>
                  {result.fullName} · {result.position}
                </p>
                <div className="tests__result-stats">
                  <div>
                    <strong>{result.correct}</strong>
                    <span>Правильных</span>
                  </div>
                  <div>
                    <strong>{result.total}</strong>
                    <span>Всего вопросов</span>
                  </div>
                  <div>
                    <strong>
                      {new Date(result.date).toLocaleString('ru-RU')}
                    </strong>
                    <span>Дата</span>
                  </div>
                </div>
                <p
                  role="status"
                  className={`tests__send-status tests__send-status--${result.sent ? 'success' : 'error'}`}
                >
                  {result.sent
                    ? 'Результат отправлен в Discord.'
                    : result.message}
                </p>
                {!result.sent && (
                  <button
                    className="tests-modal__button"
                    disabled={busy}
                    onClick={finish}
                  >
                    {busy ? 'Отправляем…' : 'Повторить отправку в Discord'}
                  </button>
                )}
                <button
                  className="tests-modal__button"
                  disabled={busy}
                  onClick={close}
                >
                  Закрыть
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
