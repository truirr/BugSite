import { useState } from 'react'
import { NavLink } from 'react-router-dom'

import './Header.css'

const links = [
  { to: '/', label: 'Главная' },
  { to: '/first-aid', label: 'ПМП' },
  { to: '/estate', label: 'Поместье' },
  { to: '/composition', label: 'Состав' },
  { to: '/promotion', label: 'Повышение' },
  { to: '/gallery', label: 'Галерея' },
  { to: '/information', label: 'Информация' },
]

function Header() {
  const [isOpen, setIsOpen] = useState(false)

  const closeMenu = () => setIsOpen(false)

  return (
    <header className="header">
      <NavLink to="/" className="header__logo" onClick={closeMenu} aria-label="На главную">
        <span className="header__butterfly"></span>
        <span>Дыхание насекомого</span>
      </NavLink>

      <button
        className={`header__burger ${isOpen ? 'header__burger--active' : ''}`}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Открыть меню"
      >
        <span></span>
        <span></span>
      </button>

      <nav className={`header__nav ${isOpen ? 'header__nav--open' : ''}`}>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={closeMenu}
            className={({ isActive }) =>
              isActive ? 'header__link header__link--active' : 'header__link'
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}

export default Header