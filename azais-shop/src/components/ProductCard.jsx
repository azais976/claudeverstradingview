import { useState } from 'react'
import { useCart } from '../context/CartContext'
import './ProductCard.css'

export default function ProductCard({ product, delay, onExternalOrder }) {
  const { add } = useCart()
  const [added, setAdded] = useState(false)

  const isExternal = product.source === 'external'

  const handleAction = () => {
    if (isExternal) {
      onExternalOrder?.(product)
    } else {
      add(product)
      setAdded(true)
      setTimeout(() => setAdded(false), 1600)
    }
  }

  return (
    <div className={`product-card fade-in delay-${delay}`}>
      <div
        className="product-img-wrap"
        onClick={isExternal ? () => onExternalOrder?.(product) : undefined}
        style={isExternal ? { cursor: 'pointer' } : {}}
      >
        <img src={product.image} alt={product.name} loading="lazy" />
        {product.tag && (
          <span className={`product-tag ${product.tag === 'Promo' ? 'tag-promo' : 'tag-new'}`}>
            {product.tag}
          </span>
        )}
        <button
          className={`quick-add${added ? ' added' : ''}`}
          onClick={handleAction}
          aria-label={isExternal ? 'Commander' : 'Ajouter au panier'}
        >
          {isExternal ? 'Commander' : added ? '✓ Ajouté' : '+ Panier'}
        </button>
      </div>
      <div className="product-info">
        <h4 className="product-name">{product.name}</h4>
        <div className="product-prices">
          <span className="product-price">{product.price} €</span>
          {product.originalPrice && (
            <span className="product-original">{product.originalPrice} €</span>
          )}
        </div>
      </div>
    </div>
  )
}
