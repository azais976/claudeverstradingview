import { categories } from '../data/products'
import './Categories.css'

export default function Categories() {
  const scrollTo = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <section id="categories" className="categories-section">
      <div className="section-header fade-in">
        <p className="section-eyebrow">Nos univers</p>
        <h2 className="section-title">Explorez par catégorie</h2>
      </div>
      <div className="categories-grid">
        {categories.map((cat, i) => (
          <button
            key={cat.id}
            className={`cat-card fade-in delay-${i + 1}`}
            onClick={() => scrollTo(cat.id)}
          >
            <div className="cat-img">
              <img src={cat.image} alt={cat.label} />
            </div>
            <div className="cat-overlay">
              <h3>{cat.label}</h3>
              <p>{cat.description}</p>
              <span className="cat-cta">Voir →</span>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}
