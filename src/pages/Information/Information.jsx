import './Information.css'

const commands = [
  ['/ooc или //', 'Общий НРП чат'],
  ['/looc или /b', 'Локальный НРП чат'],
  ['/w', 'Шёпот'],
  ['/y', 'Крик'],
  ['@ или F11', 'Вызов администратора'],
  ['/grp', 'Глобальная РП отыгровка'],
  ['/fb', 'НРП чат фракции'],
  ['/f', 'РП чат фракции'],
  ['/rpm Имя', 'РП ворон'],
  ['/me', 'РП действие от первого лица'],
  ['/do', 'РП действие от третьего лица'],
  ['/try', 'РП действие с шансом 50/50'],
  ['/roll', 'Кости от 1 до 100'],
]

function Information() {
  return (
    <section className="information page">
      <div className="page__container">
        <p className="page__eyebrow">Server Guide</p>
        <h1 className="page__title">Полезная информация</h1>

        <div className="information__grid">
          {commands.map(([command, description], index) => (
            <article className="information__command card" key={command} style={{ '--delay': `${index * 0.04}s` }}>
              <code>{command}</code>
              <p>{description}</p>
            </article>
          ))}
        </div>

        <article className="information__bind card">
          <h2>Меню анимаций</h2>
          <p>Для меню анимаций вроде «Палец вверх», «Следуй за мной» и других:</p>
          <code>bind кнопка "_DarkRp_AnimationMenu"</code>
        </article>

        <a
          className="information__link"
          href="https://docs.google.com/document/d/1XkDl-hlAvIZ7_dDvbWC5jVnv55RF-MttGsxXYHtbdtI/edit?tab=t.0#heading=h.afdf4qoy8i4n"
          target="_blank"
          rel="noreferrer"
        >
          Открыть действующий устав истребителей
        </a>
      </div>
    </section>
  )
}

export default Information