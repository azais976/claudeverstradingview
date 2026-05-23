import { useState } from 'react'
import './OrderTracking.css'

const STEPS = [
  { label: 'Commande reçue',  icon: '📋' },
  { label: 'En préparation',  icon: '📦' },
  { label: 'Expédiée',        icon: '🚚' },
  { label: 'En livraison',    icon: '🏠' },
  { label: 'Livrée',          icon: '✅' },
]

function loadOrder(id) {
  try {
    const saved = JSON.parse(localStorage.getItem('azais_orders') || '[]')
    return saved.find(o => o.id === id.toUpperCase()) || null
  } catch { return null }
}

export default function OrderTracking({ open, onClose }) {
  const [input, setInput] = useState('')
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')

  const search = () => {
    const key = input.trim().toUpperCase()
    if (!key) { setError('Entrez un numéro de commande.'); return }
    const found = loadOrder(key)
    if (!found) {
      setError('Commande introuvable. Vérifiez le numéro reçu dans votre email de confirmation.')
      setOrder(null)
      return
    }
    setOrder(found)
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
            <p>Entrez le numéro reçu dans votre email de confirmation</p>
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
                <img src={order.productImage} alt={order.productName} />
              </div>
              <div className="tracking-product-info">
                <p className="tracking-order-num">Commande #{order.id}</p>
                <h4>{order.productName}</h4>
                {order.size && <p className="tracking-date">Taille : {order.size} · Qté : {order.qty}</p>}
                <p className="tracking-date">Commandé le {order.date}</p>
                {order.trackingNum && (
                  <p className="tracking-num">N° de suivi : <strong>{order.trackingNum}</strong></p>
                )}
                <p className="tracking-carrier">Transporteur : {order.carrier || 'En attente d\'assignation'}</p>
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

            <div className="tracking-status-badge">
              {STEPS[order.status].icon} {STEPS[order.status].label}
            </div>

            {order.customer && (
              <p className="tracking-delivered-to">
                Livraison chez : {order.customer.firstName} {order.customer.lastName} — {order.customer.city}
              </p>
            )}

            <button className="tracking-reset" onClick={reset}>← Chercher une autre commande</button>
          </div>
        )}
      </div>
    </div>
  )
}
