import { Link } from 'react-router-dom'
import './PageIntro.css'

// Общая шапка справочников. Содержимое и символ задаются на самой странице.
export default function PageIntro({
  eyebrow,
  title,
  accent,
  description,
  symbol,
  meta,
  action,
}) {
  return (
    <header className="page-intro">
      <div className="page-intro__copy">
        <p className="page__eyebrow">{eyebrow}</p>
        <h1>
          {title}
          <span>{accent}</span>
        </h1>
        <p className="page-intro__description">{description}</p>
        <div className="page-intro__footer">
          {meta && <span className="page-intro__meta">{meta}</span>}
          {action && (
            <Link to={action.to}>
              {action.label} <span aria-hidden="true">↗</span>
            </Link>
          )}
        </div>
      </div>
      <div className="page-intro__crest" aria-hidden="true">
        <span>{symbol}</span>
        <small>BUTTERFLY ESTATE</small>
        <i />
      </div>
    </header>
  )
}
