import { useState } from 'react'
import { NavLink } from 'react-router-dom'

import './Header.css'

const links = [
  { to: '/', label: 'Главная' },
  { to: '/first-aid', label: 'ПМП' },
  { to: '/estate', label: 'Поместье' },
  { to: '/composition', label: 'Состав' },
  {
    label: 'Повышение',
    children: [
      { to: '/promotion', label: 'Система повышения' },
      { to: '/promotion-info', label: 'Доп. информация' },
    ],
  },
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
        {links.map((link) => {
          if (link.children) {
            return (
              <div className="header__dropdown" key={link.label}>
                <NavLink
                  to="/promotion"
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    isActive
                      ? 'header__link header__link--active header__link--dropdown'
                      : 'header__link header__link--dropdown'
                  }
                >
                  {link.label}
                  <span className="header__arrow"></span>
                </NavLink>

                <div className="header__submenu">
                  {link.children.map((child) => (
                    <NavLink
                      key={child.to}
                      to={child.to}
                      onClick={closeMenu}
                      className={({ isActive }) =>
                        isActive
                          ? 'header__submenu-link header__submenu-link--active'
                          : 'header__submenu-link'
                      }
                    >
                      {child.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            )
          }

          return (
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
          )
        })}
      </nav>
    </header>
  )
}

export default Header