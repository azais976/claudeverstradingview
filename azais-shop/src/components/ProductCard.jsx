import { useState } from 'react'
import { useCart } from '../context/CartContext'
import './ProductCard.css'

export default function ProductCard({ product, delay, onExternalOrder }) {
  const { add } = useCart()
  const [added, setAdded] = useState(false)

  const isAirtn = product.source === 'airtn'

  const handleAction = () => {
    if (isAirtn) {
      onExternalOrder?.(product)
    } else {
      add(product)
      setAdded(true)
      setTimeout(() => setAdded(false), 1600)
    }
  }

  return (
    <div className={`product-card fade-in delay-${delay}`}>
      <div className="product-img-wrap" onClick={isAirtn ? () => onExternalOrder?.(product) : undefined} style={isAirtn ? { cursor: 'pointer' } : {}}>
        <img src={product.image} alt={product.name} loading="lazy" />
        {product.tag && (
          <span className={`product-tag ${product.tag === 'Promo' ? 'tag-promo' : product.tag === 'Airtn.fr' ? 'tag-airtn' : 'tag-new'}`}>
            {product.tag}
          </span>
        )}
        <button
          className={`quick-add${added ? ' added' : ''}${isAirtn ? ' airtn' : ''}`}
          onClick={handleAction}
          aria-label={isAirtn ? 'Commander' : 'Ajouter au panier'}
        >
          {isAirtn ? '🛒 Commander' : added ? '✓ Ajouté' : '+ Panier'}
        </button>
      </div>
      <div className="product-info">
        <h4 className="product-name">{product.name}</h4>
        <div className="product-prices">
          {isAirtn ? (
            <span className="product-price airtn-price">Prix sur demande</span>
          ) : (
            <>
              <span className="product-price">{product.price} €</span>
              {product.originalPrice && (
                <span className="product-original">{product.originalPrice} €</span>
              )}
            </>
          )}
        </div>
        {isAirtn && <p className="airtn-source">via airtn.fr</p>}
      </div>
    </div>
  )
}
