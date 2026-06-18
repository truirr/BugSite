import heroBg from '../../assets/img/Hero_Background.png'
import shinobu from '../../assets/img/Hero_Shinobu.png'

import './Hero.css'

function Hero() {
  return (
    <section className="hero">
      <img className="hero__bg" src={heroBg} alt="" />

      <div className="hero__shade"></div>
      <div className="hero__petals"></div>

      <div className="hero__content">
        <p className="hero__eyebrow">Butterfly Estate</p>

        <h1 className="hero__title">
          Дыхание
          <span>насекомого</span>
        </h1>

        <blockquote className="hero__quote">
          «Когда моя жизнь была разрушена, я впервые осознала, что счастье
          держится на тончайшем куске стекла»
          <cite>— Шинобу Кочо</cite>
        </blockquote>
      </div>

      <img className="hero__shinobu" src={shinobu} alt="Шинобу Кочо" />
    </section>
  )
}

export default Hero