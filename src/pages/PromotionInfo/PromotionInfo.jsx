import PageIntro from '../../components/PageIntro/PageIntro'
import { useState } from 'react'
import charterParagraphs from '../../data/charter-source.json'
import { recommendations } from '../../data/promotion'
import './PromotionInfo.css'

// Сохраняем исходные формулировки и номера пунктов, включая нумерацию документа.
const chapters = []
for (const paragraph of charterParagraphs) {
  if (paragraph.startsWith('Глава ')) {
    chapters.push({ title: paragraph, paragraphs: [] })
  } else if (chapters.length) {
    chapters[chapters.length - 1].paragraphs.push(paragraph)
  }
}

export default function PromotionInfo() {
  const [search, setSearch] = useState('')
  const query = search.trim().toLocaleLowerCase('ru')
  const visibleChapters = chapters.filter((chapter) =>
    `${chapter.title} ${chapter.paragraphs.join(' ')}`
      .toLocaleLowerCase('ru')
      .includes(query),
  )

  return (
    <section className="promotion-info page">
      <div className="page__container promotion-info__container">
        <PageIntro
          eyebrow="Corps charter / Устав"
          title="Правила, на которые"
          accent="можно опереться."
          description="Устав корпуса истребителей: обязанности, порядок повышений и правила рекомендаций."
          symbol="律"
          meta="13 глав устава"
          action={{ to: '/promotion', label: 'Калькулятор повышения' }}
        />

        <div className="charter__highlights">
          {recommendations.map((item) => (
            <article key={item.degree}>
              <span>{item.title}</span>
              <h2>{item.benefit}</h2>
              <p>{item.description}</p>
              <small>{item.issuer}</small>
            </article>
          ))}
        </div>
        <div className="charter__note">
          <strong>Важно для повышения</strong>
          <p>
            Одна рекомендация за раз, срок действия — 72 часа. Требуется
            утверждение в Discord. Даже один действующий выговор блокирует
            повышение в ранге. Рекомендацию также можно использовать для снятия
            выговора или запроса игровой валюты — это отдельное решение
            руководства.
          </p>
        </div>

        <label className="charter__search">
          Найти в уставе
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Например: патруль, выговор, Цугуко"
          />
        </label>
        <p className="charter__count" role="status">
          Глав найдено: {visibleChapters.length} из {chapters.length}
        </p>
        <div className="charter__chapters">
          {visibleChapters.map((chapter) => (
            <details
              className="charter__chapter"
              key={`${chapter.title}-${Boolean(query)}`}
              open={query ? true : undefined}
            >
              <summary>
                <h2>{chapter.title}</h2>
                <span aria-hidden="true">+</span>
              </summary>
              <div>
                {chapter.paragraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </details>
          ))}
        </div>
        {!visibleChapters.length && (
          <p>Совпадений нет. Попробуй другое слово.</p>
        )}
        <p className="charter__source">
          Источник: «Устав организации “Истребители на демонов”.docx». Сохранены
          формулировки и нумерация оригинала. Окончательное толкование устава
          принадлежит Главе Фракции.
        </p>
      </div>
    </section>
  )
}
