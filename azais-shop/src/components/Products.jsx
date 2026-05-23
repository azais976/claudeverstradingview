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
