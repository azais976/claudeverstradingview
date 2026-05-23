import { useEffect, useState } from 'react'
import './Hero.css'

export default function Hero() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <section className="hero">
      <div className={`hero-content${visible ? ' visible' : ''}`}>
        <p className="hero-eyebrow">Collection Printemps 2025</p>
        <h1 className="hero-title">
          Élevez<br />
          <em>votre style</em>
        </h1>
        <p className="hero-desc">
          Des pièces intemporelles pensées pour votre quotidien.<br />
          Qualité premium, style affirmé.
        </p>
        <div className="hero-actions">
          <a
            href="#hauts"
            className="btn-primary"
            onClick={(e) => { e.preventDefault(); document.getElementById('hauts')?.scrollIntoView({ behavior: 'smooth' }) }}
          >
            Découvrir la collection
          </a>
          <a
            href="#categories"
            className="btn-ghost"
            onClick={(e) => { e.preventDefault(); document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' }) }}
          >
            Voir les catégories
          </a>
        </div>
      </div>

      <div className={`hero-visual${visible ? ' visible' : ''}`}>
        <div className="hero-img-wrap">
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=900&q=85"
            alt="Azais Shop collection"
          />
          <div className="hero-float-card">
            <span className="hero-float-dot" />
            <div>
              <p className="hero-float-label">Nouveautés</p>
              <p className="hero-float-value">+24 articles</p>
            </div>
          </div>
        </div>
      </div>

      <div className="hero-scroll-hint">
        <div className="scroll-line" />
        <span>Défiler</span>
      </div>
    </section>
  )
}
