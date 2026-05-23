import { useState } from 'react'
import './OrderTracking.css'
import { products } from '../data/products'

const DEMO_ORDERS = {
  'AZS-1001': { productId: 13, status: 3, date: '2025-05-18', carrier: 'Colissimo', trackingNum: '6A12345678901' },
  'AZS-1002': { productId: 32, status: 2, date: '2025-05-20', carrier: 'DHL', trackingNum: 'JD014600004714390988' },
  'AZS-1003': { productId: 24, status: 4, date: '2025-05-14', carrier: 'Chronopost', trackingNum: 'XK998471002FR' },
  'AZS-1004': { productId: 3, status: 1, date: '2025-05-22', carrier: 'Colissimo', trackingNum: null },
}

const STEPS = [
  { label: 'Commande reçue', icon: '📋' },
  { label: 'En préparation', icon: '📦' },
  { label: 'Expédiée', icon: '🚚' },
  { label: 'En livraison', icon: '🏠' },
  { label: 'Livrée', icon: '✅' },
]

export default function OrderTracking({ open, onClose }) {
  const [input, setInput] = useState('')
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')

  const search = () => {
    const key = input.trim().toUpperCase()
    if (!key) { setError('Entrez un numéro de commande.'); return }
    const found = DEMO_ORDERS[key]
    if (!found) { setError('Commande introuvable. Vérifiez le numéro reçu par email.'); setOrder(null); return }
    const product = products.find(p => p.id === found.productId)
    setOrder({ ...found, product })
    setError('')
  }

  const reset = () => { setInput(''); setOrder(null); setError('') }

  if (!open) return null

  return (
    <div className="tracking-backdrop" onClick={onClose}>
      <div className="tracking-modal" onClick={e => e.stopPropagation()}>
        <div className="tracking-header">
          <div>
            <h3>Suivi de commande</h3>
            <p>Entrez votre numéro de commande (ex: AZS-1001)</p>
          </div>
          <button className="tracking-close" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="tracking-search">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="AZS-XXXX"
            onKeyDown={e => e.key === 'Enter' && search()}
            className="tracking-input"
          />
          <button className="tracking-btn" onClick={search}>Rechercher</button>
        </div>

        {error && <p className="tracking-error">{error}</p>}

        {order && (
          <div className="tracking-result">
            <div className="tracking-product">
              <div className="tracking-product-img">
                <img src={order.product?.image} alt={order.product?.name} />
              </div>
              <div className="tracking-product-info">
                <p className="tracking-order-num">Commande #{input.toUpperCase()}</p>
                <h4>{order.product?.name}</h4>
                <p className="tracking-date">Commandé le {order.date}</p>
                {order.trackingNum && (
                  <p className="tracking-num">N° de suivi : <strong>{order.trackingNum}</strong></p>
                )}
                <p className="tracking-carrier">Transporteur : {order.carrier}</p>
              </div>
            </div>

            <div className="tracking-timeline">
              {STEPS.map((step, i) => (
                <div key={i} className={`tracking-step${i <= order.status ? ' done' : ''}${i === order.status ? ' active' : ''}`}>
                  <div className="step-icon">{step.icon}</div>
                  <div className="step-line" />
                  <p className="step-label">{step.label}</p>
                </div>
              ))}
            </div>

            <div className={`tracking-status-badge status-${order.status}`}>
              {STEPS[order.status].icon} {STEPS[order.status].label}
            </div>

            <button className="tracking-reset" onClick={reset}>← Chercher une autre commande</button>
          </div>
        )}
      </div>
    </div>
  )
}
