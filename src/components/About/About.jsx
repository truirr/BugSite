import './About.css'
import butterfly from '../../assets/img/Butterfly.png'

const features = [
  {
    title: 'Скорость и ловкость',
    text: 'Атаки быстрые и точные, имитируют движения насекомых: жала осы, порхание бабочки, зигзаги многоножки.',
  },
  {
    title: 'Многочисленные мелкие повреждения',
    text: 'Цель — нанести множество мелких порезов или уколов, чтобы яд быстро распространился по телу демона.',
  },
  {
    title: 'Зависимость от яда',
    text: 'Эффективность атак напрямую связана с силой и составом яда. Шинобу может смешивать и усиливать токсины прямо в бою.',
  },
  {
    title: 'Ограниченное число форм',
    text: 'У Дыхания насекомого всего четыре известные техники. Это требует максимальной эффективности в каждом движении.',
  },
  {
    title: 'Задержка действия',
    text: 'Даже самый сильный яд не убивает мгновенно. Поэтому стиль требует уклонения, терпения и точного расчёта.',
  },
  {
    title: 'Столп насекомого',
    text: 'Наиболее совершенным пользователем Дыхания насекомого является его создательница — Шинобу Кочо.',
  },
]

function About() {
  return (
    <section className="about">
      <div className="about__bg-orb about__bg-orb--left"></div>
      <div className="about__bg-orb about__bg-orb--right"></div>
      <div className="about__bg-grid"></div>
      <div className="about__glow"></div>

      <img
        src={butterfly}
        alt=""
        className="about__butterfly about__butterfly--one"
      />
      <img
        src={butterfly}
        alt=""
        className="about__butterfly about__butterfly--two"
      />
      <img
        src={butterfly}
        alt=""
        className="about__butterfly about__butterfly--three"
      />

      <div className="about__container">
        <div className="about__header reveal-up">
          <p className="about__eyebrow">About breathing style</p>
          <h2 className="about__title">Принципы и особенности стиля</h2>
          <p className="about__subtitle">
            Техника, созданная не грубой силой, а точностью, скоростью,
            ядом и предельным контролем движений.
          </p>
        </div>

        <div className="about__grid">
          {features.map((item, index) => (
            <article
              className="about__card card"
              style={{ '--delay': `${index * 0.08}s` }}
              key={item.title}
            >
              <span className="about__number">
                {String(index + 1).padStart(2, '0')}
              </span>

              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>

        <article className="about__origin card">
          <div className="about__origin-head">
            <p className="about__eyebrow">Origin</p>
            <h3>Происхождение и цель</h3>
          </div>

          <div className="about__origin-texts">
            <div className="about__origin-block">
              <p>
                Стиль произошёл от «Дыхания цветка» и создан Шинобу специально
                для компенсации её недостатка физической силы: она не может
                обезглавить демонов, как большинство истребителей.
              </p>
            </div>

            <div className="about__origin-block">
              <p>
                Вместо этого техника делает упор на яд на основе глицинии —
                вещество, смертельно опасное для демонов.
              </p>
            </div>

            <div className="about__origin-block">
              <p>
                Меч Шинобу модифицирован: он тонкий и острый, напоминает жало
                насекомого.
              </p>
            </div>

            <div className="about__origin-block">
              <p>
                Это позволяет не рубить, а вводить яд через мелкие порезы и
                колющие удары.
              </p>
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}

export default About