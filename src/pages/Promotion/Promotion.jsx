import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  promotionTracks,
  rankNames,
  rankSymbols,
  recommendations,
} from '../../data/promotion'
import PromotionCalculator from './components/PromotionCalculator'
import './Promotion.css'

export default function Promotion() {
  const [trackId, setTrackId] = useState(promotionTracks[0].id)
  const [stepIndex, setStepIndex] = useState(1)
  const track = promotionTracks.find((item) => item.id === trackId)
  const step = track.steps[stepIndex]

  function changeTrack(nextTrackId) {
    setTrackId(nextTrackId)
    setStepIndex(0)
  }

  return (
    <section className="promotion page">
      <div className="promotion__ambient" aria-hidden="true">
        <span>蝶</span>
        <span>✦</span>
        <span>✧</span>
      </div>
      <div className="page__container promotion__container">
        <header className="promotion__intro">
          <div>
            <p className="page__eyebrow">Butterfly / Путь истребителя</p>
            <h1>
              Каждый ранг.
              <br />
              <span>новая ступень.</span>
            </h1>
            <p>
              Требования, рекомендации и твой прогресс. Выбери переход и узнай,
              что осталось до следующего звания.
            </p>
            <a href="#promotion-selection" className="promotion__button">
              Рассчитать повышение ↓
            </a>
          </div>
          <div className="promotion__crest" aria-hidden="true">
            <span>昇</span>
            <small>ОТ ПЕРВОГО ШАГА К МАСТЕРСТВУ</small>
          </div>
        </header>

        <div
          className="promotion__ranks"
          aria-label="Ранги от младшего к старшему"
        >
          {rankNames.map((name, index) => (
            <div
              className={`promotion__rank ${step.to === name ? 'promotion__rank--target' : ''}`}
              key={name}
            >
              <span>{rankSymbols[index]}</span>
              <p>{name}</p>
            </div>
          ))}
        </div>

        <section
          className="promotion__selection"
          id="promotion-selection"
          aria-labelledby="promotion-select-heading"
        >
          <div className="promotion__section-heading">
            <div>
              <p className="page__eyebrow">01 / Составь свой план</p>
              <h2 id="promotion-select-heading">Следующее повышение</h2>
            </div>
            <Link to="/promotion-info">Устав и рекомендации ↗</Link>
          </div>
          <div className="promotion__selectors">
            <label className="promotion__field">
              Раздел системы повышения
              <select
                value={trackId}
                onChange={(event) => changeTrack(event.target.value)}
              >
                {promotionTracks.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="promotion__field">
              Текущий ранг → следующий ранг
              <select
                value={stepIndex}
                onChange={(event) => setStepIndex(Number(event.target.value))}
              >
                {track.steps.map((item, index) => (
                  <option value={index} key={item.from}>
                    {item.from} → {item.to}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p className="promotion__muted">
            Выбери свою должность: Истребитель, Инструктор или Цугуко. Для
            каждого раздела действует свой список заданий.
          </p>
        </section>

        {/* key создаёт независимый расчёт при переключении раздела или ранга. */}
        <PromotionCalculator key={`${trackId}-${stepIndex}`} step={step} />

        <section
          className="promotion__recommendations"
          aria-labelledby="recommendations-heading"
        >
          <div className="promotion__section-heading">
            <div>
              <p className="page__eyebrow">02 / Поддержка на пути</p>
              <h2 id="recommendations-heading">
                Одна рекомендация. Три степени.
              </h2>
            </div>
            <span className="promotion__badge">Срок действия — 72 часа</span>
          </div>
          <div className="promotion__recommendation-grid">
            {recommendations.map((item) => (
              <article key={item.degree} className="promotion__recommendation">
                <span>{item.title}</span>
                <h3>{item.benefit}</h3>
                <p>{item.description}</p>
                <small>Выдаёт: {item.issuer}</small>
              </article>
            ))}
          </div>
          <p className="promotion__muted">
            Одновременно нельзя применять несколько рекомендаций. Ходатайство
            запрашивается на игровом сервере и утверждается в профильном канале
            Discord (глава VIII устава).
          </p>
        </section>

        <section
          className="promotion__reference"
          aria-labelledby="promotion-reference-heading"
        >
          <div className="promotion__section-heading">
            <div>
              <p className="page__eyebrow">03 / Полный маршрут</p>
              <h2 id="promotion-reference-heading">Все переходы раздела</h2>
            </div>
          </div>
          {track.steps.map((item, index) => (
            <details className="promotion__step" key={item.from}>
              <summary>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h3>
                  {item.from} → {item.to}
                </h3>
                <span className="promotion__step-plus" aria-hidden="true">
                  +
                </span>
              </summary>
              <ol>
                {item.tasks.map((task, taskIndex) => (
                  <li key={taskIndex}>{task}</li>
                ))}
              </ol>
              <button
                type="button"
                className="promotion__button"
                onClick={() => {
                  setStepIndex(index)
                  document
                    .getElementById('promotion-selection')
                    ?.scrollIntoView({
                      behavior: window.matchMedia(
                        '(prefers-reduced-motion: reduce)',
                      ).matches
                        ? 'instant'
                        : 'smooth',
                    })
                }}
              >
                Рассчитать этот переход
              </button>
            </details>
          ))}
        </section>

        <div className="promotion__footnote">
          <strong>Перед подачей отчёта</strong>
          <p>
            При отсутствии Столпа или его официальном отпуске аттестацию
            запрашивают у Кагаи Убуяшики. Обычно Столп обязан выдать задание в
            течение 24 часов после официального RP-запроса через ворона.
          </p>
          <p>
            В последнем блоке есть задание проверить крышу, а п. 2.3 устава
            запрещает находиться на крышах. Согласуй такое задание с
            руководством заранее.
          </p>
          <Link to="/promotion-info">Открыть полный устав →</Link>
        </div>
      </div>
    </section>
  )
}
