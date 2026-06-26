import './Footer.css'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__glow footer__glow--left"></div>
      <div className="footer__glow footer__glow--right"></div>

      <div className="footer__container">
        <div className="footer__brand">
          <div className="footer__mark">蝶</div>

          <div>
            <p className="footer__eyebrow">Created by</p>
            <h2>Leil</h2>
            <a
              className="footer__discord"
              href="https://discord.com/users/@me"
              onClick={(event) => event.preventDefault()}
              title="Discord username"
            >
              Discord: truirr
            </a>
          </div>
        </div>

        <div className="footer__center">
          <p>
            Фан-сайт отряда Дыхания насекомого, созданный для удобного доступа
            к информации, составу, лечению, тестам и материалам проекта.
          </p>

          <div className="footer__butterflies" aria-hidden="true">
            <span>✦</span>
            <span>蝶</span>
            <span>✦</span>
          </div>
        </div>

        <div className="footer__links">
          <p className="footer__eyebrow">Project Discord</p>

          <a
            className="footer__button"
            href="https://discord.gg/s8FaEVr25"
            target="_blank"
            rel="noreferrer"
          >
            Перейти в Discord
          </a>

          <span className="footer__note">
            Сервер проекта, на котором играет отряд насекомого.
          </span>
        </div>
      </div>

      <div className="footer__bottom">
        <span>© 2026 Butterfly Squad</span>
        <span>Fan project. Not affiliated with official Demon Slayer media.</span>
      </div>
    </footer>
  )
}

export default Footer