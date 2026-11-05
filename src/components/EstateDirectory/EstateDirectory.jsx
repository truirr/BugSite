import { Link } from 'react-router-dom'
import './EstateDirectory.css'

const sections = [
  {
    to: '/first-aid',
    symbol: '救',
    title: 'Помогать',
    text: 'Первая помощь и RP-лечение',
    label: 'Медицинская практика',
  },
  {
    to: '/promotion',
    symbol: '昇',
    title: 'Развиваться',
    text: 'Требования и калькулятор повышения',
    label: 'Путь истребителя',
  },
  {
    to: '/tests',
    symbol: '学',
    title: 'Проверять себя',
    text: 'Тесты по материалам поместья',
    label: 'Проверка знаний',
  },
  {
    to: '/gallery',
    symbol: '蝶',
    title: 'Быть частью',
    text: 'Фотографии и история отряда',
    label: 'Наши воспоминания',
  },
]

export default function EstateDirectory() {
  return (
    <section className="estate-directory" aria-labelledby="directory-title">
      <div className="page__container">
        <div className="estate-directory__heading">
          <div>
            <p className="page__eyebrow">Твоё место в поместье</p>
            <h2 id="directory-title">Выбери свой следующий шаг.</h2>
          </div>
          <Link to="/information">Справочник сервера ↗</Link>
        </div>
        <div className="estate-directory__grid">
          {sections.map((section, index) => (
            <Link
              to={section.to}
              className="estate-directory__card"
              key={section.to}
            >
              <div className="estate-directory__top">
                <span>{String(index + 1).padStart(2, '0')}</span>
                <span aria-hidden="true">↗</span>
              </div>
              <span className="estate-directory__symbol" aria-hidden="true">
                {section.symbol}
              </span>
              <small>{section.label}</small>
              <h3>{section.title}</h3>
              <p>{section.text}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
