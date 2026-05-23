import { categories } from '../data/products'
import './Categories.css'

const GENDER_GROUPS = [
  { label: null, title: 'Nos univers', eyebrow: 'Toutes catégories' },
]

export default function Categories() {
  const scrollTo = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  const main = categories.filter(c => !c.gender)
  const homme = categories.filter(c => c.gender === 'homme')
  const femme = categories.filter(c => c.gender === 'femme')

  const CatCard = ({ cat, i }) => (
    <button
      key={cat.id}
      className={`cat-card fade-in delay-${(i % 4) + 1}`}
      onClick={() => scrollTo(cat.id)}
    >
      <div className="cat-img">
        <img src={cat.image} alt={cat.label} />
      </div>
      <div className="cat-overlay">
        {cat.gender && <span className="cat-gender-tag">{cat.gender === 'homme' ? '♂ Homme' : '♀ Femme'}</span>}
        <h3>{cat.label}</h3>
        <p>{cat.description}</p>
        <span className="cat-cta">Voir →</span>
      </div>
    </button>
  )

  return (
    <section id="categories" className="categories-section">
      <div className="section-header fade-in">
        <p className="section-eyebrow">Toutes catégories</p>
        <h2 className="section-title">Explorez par catégorie</h2>
      </div>
      <div className="categories-grid">
        {main.map((cat, i) => <CatCard key={cat.id} cat={cat} i={i} />)}
      </div>

      <div className="gender-section">
        <div className="gender-group">
          <h3 className="gender-title">
            <span className="gender-dot homme" />
            Homme
          </h3>
          <div className="categories-grid-small">
            {homme.map((cat, i) => <CatCard key={cat.id} cat={cat} i={i} />)}
          </div>
        </div>
        <div className="gender-group">
          <h3 className="gender-title">
            <span className="gender-dot femme" />
            Femme
          </h3>
          <div className="categories-grid-small">
            {femme.map((cat, i) => <CatCard key={cat.id} cat={cat} i={i} />)}
          </div>
        </div>
      </div>
    </section>
  )
}
