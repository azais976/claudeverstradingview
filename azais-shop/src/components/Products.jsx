import { useState } from 'react'
import { products, categories } from '../data/products'
import ProductCard from './ProductCard'
import ExternalOrderModal from './ExternalOrderModal'
import './Products.css'

export default function Products() {
  const [externalProduct, setExternalProduct] = useState(null)

  return (
    <>
      <section className="products-section">
        {categories.map((cat) => {
          const catProducts = products.filter((p) => p.category === cat.id)
          return (
            <div key={cat.id} id={cat.id} className="category-section">
              <div className="category-section-header fade-in">
                <div>
                  <p className="section-eyebrow">{cat.description}</p>
                  <h2 className="section-title-sm">{cat.label}</h2>
                </div>
                <span className="product-count">{catProducts.length} articles</span>
              </div>
              {cat.id === 'chaussures' && (
                <div className="airtn-banner fade-in">
                  <div className="airtn-banner-left">
                    <span className="airtn-badge">Partenaire</span>
                    <p>Collection Nike Air TN disponible via <strong>airtn.fr</strong> — cliquez sur une paire pour commander</p>
                  </div>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                </div>
              )}
              <div className="products-grid">
                {catProducts.map((p, i) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    delay={(i % 4) + 1}
                    onExternalOrder={setExternalProduct}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </section>

      <ExternalOrderModal
        open={!!externalProduct}
        product={externalProduct}
        onClose={() => setExternalProduct(null)}
      />
    </>
  )
}
