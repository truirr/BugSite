import './Composition.css'

const groups = [
  {
    rank: 'Столп',
    icon: '柱',
    members: ['[🦝] Шинобу Кочо | Фанатка Иры'],
  },
  {
    rank: 'Цугуко',
    icon: '継',
    members: ['Hiroto Takayama', 'Свободный слот'],
  },
  {
    rank: 'Канао Цуюри',
    icon: '花',
    members: ['Kanao | Musasi Hagivara'],
  },
  {
    rank: 'Инструктор',
    icon: '教',
    members: ['Свободный слот', 'Kaito Fujimoto', 'Свободный слот'],
  },
  {
    rank: 'Истребитель',
    icon: '滅',
    members: [
      'Hiroshi Akarui',
      'Таву Актагаву / не Рядовой ША',
      'Дзётаро Арасака / Макио',
      'Оки Мирай',
      'Лейл Мэй',
      'Filo Fuyu',
      'Iseri Ashina',
      'Зеницу | Проотец грома',
      'Аманэ / Hinami Matsuda',
      'Theotto Rikko',
    ],
  },
  {
    rank: 'Ученик',
    icon: '学',
    members: ['Свободный слот', 'Свободный слот', 'Свободный слот'],
  },
  {
    rank: 'Чистильщик',
    icon: '清',
    members: ['Кэтсэро Накамура', 'Асато Синоши'],
  },
  {
    rank: 'Донат слот',
    icon: '蝶',
    members: ['Miko Fujiwara'],
  },
]

function Composition() {
  return (
    <section className="composition page">
      <div className="page__container">
        <p className="page__eyebrow">Butterfly Squad</p>
        <h1 className="page__title">Состав дыхания насекомого</h1>

        <div className="composition__grid">
          {groups.map((group, index) => (
            <article className="composition__card card" key={group.rank} style={{ '--delay': `${index * 0.07}s` }}>
              <div className="composition__kanji">{group.icon}</div>
              <h2>{group.rank}</h2>

              <ul>
                {group.members.map((member) => (
                  <li className={member === 'Свободный слот' ? 'composition__empty' : ''} key={member + group.rank}>
                    {member}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Composition