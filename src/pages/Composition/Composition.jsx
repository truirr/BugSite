import { useState } from 'react'
import useContent from '../../lib/useContent'
import initialGroups from '../../lib/initial-groups.json'
import './Composition.css'

function Portrait({ member }) {
  const [failed, setFailed] = useState(false)
  return (
    <div className="composition__portrait">
      {member.avatar && !failed ? (
        <img
          src={member.avatar}
          alt={member.name}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <span aria-hidden="true">{member.name.slice(0, 1).toUpperCase()}</span>
      )}
    </div>
  )
}
export default function Composition() {
  const { content, error } = useContent()
  const groups = content?.groups || initialGroups
  const occupied = groups
    .flatMap((g) => g.members)
    .filter((m) => m.name !== 'Свободный слот').length
  return (
    <section className="composition page">
      <div className="page__container">
        <div className="composition__intro">
          <div>
            <p className="page__eyebrow">Butterfly Squad / 人々</p>
            <h1>
              Люди
              <br />
              <span>поместья Бабочки</span>
            </h1>
            <p className="composition__lead">
              Разные истории. Одно дыхание. Те, кто делает наше поместье домом.
            </p>
          </div>
          <div className="composition__seal" aria-hidden="true">
            蝶<span>ДЫХАНИЕ НАСЕКОМОГО</span>
          </div>
        </div>
        <div className="composition__summary">
          <span>
            <strong>{String(occupied).padStart(2, '0')}</strong> участников
          </span>
          <span>
            <strong>{String(groups.length).padStart(2, '0')}</strong> рангов
          </span>
          <span className="composition__summary-note">Одна команда</span>
        </div>
        {error && (
          <p role="status">
            Не удалось обновить состав. Показана исходная версия.
          </p>
        )}
        {groups.map((group, gi) => (
          <section className="composition__group" key={`${group.rank}-${gi}`}>
            <div className="composition__group-heading">
              <span className="composition__kanji">{group.icon}</span>
              <h2>{group.rank}</h2>
              <span className="composition__line" />
              <small>{String(gi + 1).padStart(2, '0')}</small>
            </div>
            <div className="composition__members">
              {group.members.map((member, mi) =>
                member.name === 'Свободный слот' ? (
                  <article className="composition__vacancy" key={mi}>
                    <span>＋</span>
                    <h3>Место для новой истории</h3>
                    <p>Свободный слот · {group.rank}</p>
                  </article>
                ) : (
                  <article
                    className={`composition__person ${gi === 0 ? 'composition__person--leader' : ''}`}
                    key={`${mi}-${member.avatar}`}
                  >
                    <Portrait member={member} />
                    <div className="composition__identity">
                      <p>{group.rank}</p>
                      <h3>{member.name}</h3>
                      <span>
                        Butterfly Squad <b>✦</b>
                      </span>
                    </div>
                  </article>
                ),
              )}
            </div>
          </section>
        ))}
      </div>
    </section>
  )
}
