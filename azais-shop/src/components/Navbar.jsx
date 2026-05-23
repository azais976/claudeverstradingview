import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import './Navbar.css'

const NAV = [
  { label: 'Hauts', id: 'hauts' },
  { label: 'Bas', id: 'bas' },
  { label: 'Couvre-Chef', id: 'couvre-chef' },
  {
    label: 'Chaussures', children: [
      { label: 'Homme', id: 'chaussures-homme' },
      { label: 'Femme', id: 'chaussures-femme' },
    ]
  },
  { label: 'Ceintures', id: 'ceintures' },
  {
    label: 'Sous-vêtements', children: [
      { label: 'Homme', id: 'sous-vetements-homme' },
      { label: 'Femme', id: 'sous-vetements-femme' },
    ]
  },
]

export default function Navbar({ onTrackingOpen }) {
  const { count, setOpen } = useCart()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState(null)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const scrollTo = (id) => {
    setMenuOpen(false)
    setOpenDropdown(null)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header className={`navbar${scrolled ? ' scrolled' : ''}`}>
      <div className="navbar-inner">
        <a className="logo" href="#">AZAIS</a>

        <nav className={`nav-links${menuOpen ? ' open' : ''}`}>
          {NAV.map((item) =>
            item.children ? (
              <div
                key={item.label}
                className="nav-dropdown-wrap"
                onMouseEnter={() => setOpenDropdown(item.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button
                  className="nav-dropdown-trigger"
                  onClick={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}
                >
                  {item.label}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                {openDropdown === item.label && (
                  <div className="nav-dropdown">
                    {item.children.map(child => (
                      <button key={child.id} onClick={() => scrollTo(child.id)} className="dropdown-item">
                        {child.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <button key={item.id} onClick={() => scrollTo(item.id)}>{item.label}</button>
            )
          )}
        </nav>

        <div className="navbar-actions">
          <button className="tracking-link" onClick={onTrackingOpen}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
            Suivi
          </button>
          <button className="cart-btn" onClick={() => setOpen(true)} aria-label="Panier">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            {count > 0 && <span className="cart-badge">{count}</span>}
          </button>
          <button className="menu-toggle" onClick={() => setMenuOpen(v => !v)} aria-label="Menu">
            <span /><span /><span />
          </button>
        </div>
      </div>
    </header>
  )
}
