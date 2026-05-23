import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import './Navbar.css'

const links = ['Hauts', 'Bas', 'Couvre-Chef', 'Chaussures']

export default function Navbar() {
  const { count, setOpen } = useCart()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const scrollTo = (id) => {
    setMenuOpen(false)
    document.getElementById(id.toLowerCase().replace('-', '-'))?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header className={`navbar${scrolled ? ' scrolled' : ''}`}>
      <div className="navbar-inner">
        <a className="logo" href="#">AZAIS</a>

        <nav className={`nav-links${menuOpen ? ' open' : ''}`}>
          {links.map((l) => (
            <button key={l} onClick={() => scrollTo(l.toLowerCase())}>{l}</button>
          ))}
        </nav>

        <div className="navbar-actions">
          <button className="cart-btn" onClick={() => setOpen(true)} aria-label="Panier">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            {count > 0 && <span className="cart-badge">{count}</span>}
          </button>
          <button className="menu-toggle" onClick={() => setMenuOpen((v) => !v)} aria-label="Menu">
            <span /><span /><span />
          </button>
        </div>
      </div>
    </header>
  )
}
