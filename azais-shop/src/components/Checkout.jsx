import { useState } from 'react'
import { sendOrderEmails } from '../services/emailService'
import './Checkout.css'

const COUNTRIES  = ['France', 'Belgique', 'Suisse', 'Luxembourg', 'Canada']
const SIZES_SHOE = ['36','37','38','39','40','41','42','43','44','45','46']
const SIZES_CLO  = ['XS','S','M','L','XL','XXL']

function genId() { return 'AZS-' + Math.floor(1000 + Math.random() * 9000) }

const isShoe    = (cat) => cat?.startsWith('chaussures')
const isClothed = (cat) => ['hauts','bas','sous-vetements-homme','sous-vetements-femme'].includes(cat)

const EMPTY = { firstName:'', lastName:'', email:'', phone:'',
  address:'', city:'', zip:'', country:'France', size:'', qty:1, notes:'' }

export default function Checkout({ open, onClose, product }) {
  const [step,    setStep]    = useState('form')
  const [loading, setLoading] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [form,    setForm]    = useState(EMPTY)
  const [errors,  setErrors]  = useState({})

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const validate = () => {
    const e = {}
    if (!form.firstName.trim())                                e.firstName = 'Requis'
    if (!form.lastName.trim())                                 e.lastName  = 'Requis'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))      e.email     = 'Email invalide'
    if (!form.address.trim())                                  e.address   = 'Requis'
    if (!form.city.trim())                                     e.city      = 'Requis'
    if (!form.zip.trim())                                      e.zip       = 'Requis'
    const needSize = isShoe(product?.category) || isClothed(product?.category)
    if (needSize && !form.size)                                e.size      = 'Choisissez une taille'
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    const id = genId()
    setOrderId(id)

    const order = {
      id,
      productId:    product.id,
      productName:  product.name,
      productImage: product.image,
      price:        product.price,
      size:         form.size,
      qty:          form.qty,
      customer:     { ...form },
      date:         new Date().toISOString().split('T')[0],
      status:       0,
      carrier:      'En attente',
      trackingNum:  null,
    }

    const saved = JSON.parse(localStorage.getItem('azais_orders') || '[]')
    localStorage.setItem('azais_orders', JSON.stringify([...saved, order]))

    try { await sendOrderEmails(order) } catch (e) { console.warn('Email:', e) }

    setLoading(false)
    setStep('success')
  }

  const handleClose = () => {
    setStep('form'); setForm(EMPTY); setErrors({}); onClose()
  }

  if (!open || !product) return null

  const sizes = isShoe(product.category) ? SIZES_SHOE : SIZES_CLO
  const showSizes = isShoe(product.category) || isClothed(product.category)

  if (step === 'success') return (
    <div className="co-backdrop" onClick={handleClose}>
      <div className="co-modal" onClick={e => e.stopPropagation()}>
        <div className="co-success">
          <div className="co-success-icon">✅</div>
          <h3>Commande confirmée !</h3>
          <p>Un email de confirmation va être envoyé à <strong>{form.email}</strong>.</p>
          <div className="co-order-badge">
            <span>Numéro de commande</span>
            <strong>{orderId}</strong>
          </div>
          <p className="co-delay">Expédition estimée sous 3 à 7 jours ouvrés.<br />
            Conservez votre numéro pour suivre votre colis.</p>
          <button className="co-submit" onClick={handleClose}>Continuer mes achats</button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="co-backdrop" onClick={handleClose}>
      <div className="co-modal" onClick={e => e.stopPropagation()}>

        <div className="co-header">
          <h3>Finaliser ma commande</h3>
          <button className="co-close" onClick={handleClose} aria-label="Fermer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="co-product">
          <div className="co-product-img">
            <img src={product.image} alt={product.name} />
          </div>
          <div>
            <p className="co-product-name">{product.name}</p>
            <p className="co-product-price">{product.price} € / unité</p>
          </div>
        </div>

        <div className="co-body">
          <p className="co-section-label">Informations personnelles</p>
          <div className="co-row">
            <div className="co-field">
              <label>Prénom <em>*</em></label>
              <input value={form.firstName} onChange={e => set('firstName', e.target.value)}
                className={errors.firstName ? 'err' : ''} placeholder="Jean" />
              {errors.firstName && <span className="co-err">{errors.firstName}</span>}
            </div>
            <div className="co-field">
              <label>Nom <em>*</em></label>
              <input value={form.lastName} onChange={e => set('lastName', e.target.value)}
                className={errors.lastName ? 'err' : ''} placeholder="Dupont" />
              {errors.lastName && <span className="co-err">{errors.lastName}</span>}
            </div>
          </div>
          <div className="co-row">
            <div className="co-field">
              <label>Email <em>*</em></label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                className={errors.email ? 'err' : ''} placeholder="jean@email.com" />
              {errors.email && <span className="co-err">{errors.email}</span>}
            </div>
            <div className="co-field">
              <label>Téléphone</label>
              <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                placeholder="+33 6 00 00 00 00" />
            </div>
          </div>

          <p className="co-section-label">Adresse de livraison</p>
          <div className="co-field co-full">
            <label>Adresse <em>*</em></label>
            <input value={form.address} onChange={e => set('address', e.target.value)}
              className={errors.address ? 'err' : ''} placeholder="12 rue de la Paix" />
            {errors.address && <span className="co-err">{errors.address}</span>}
          </div>
          <div className="co-row three">
            <div className="co-field">
              <label>Code postal <em>*</em></label>
              <input value={form.zip} onChange={e => set('zip', e.target.value)}
                className={errors.zip ? 'err' : ''} placeholder="75001" />
              {errors.zip && <span className="co-err">{errors.zip}</span>}
            </div>
            <div className="co-field">
              <label>Ville <em>*</em></label>
              <input value={form.city} onChange={e => set('city', e.target.value)}
                className={errors.city ? 'err' : ''} placeholder="Paris" />
              {errors.city && <span className="co-err">{errors.city}</span>}
            </div>
            <div className="co-field">
              <label>Pays</label>
              <select value={form.country} onChange={e => set('country', e.target.value)}>
                {COUNTRIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {showSizes && (
            <>
              <p className="co-section-label">Taille</p>
              <div className="co-sizes">
                {sizes.map(s => (
                  <button key={s} type="button"
                    className={`co-size${form.size === s ? ' active' : ''}`}
                    onClick={() => set('size', s)}>{s}</button>
                ))}
              </div>
              {errors.size && <span className="co-err">{errors.size}</span>}
            </>
          )}

          <div className="co-row">
            <div className="co-field">
              <label>Quantité</label>
              <div className="co-qty">
                <button type="button" onClick={() => set('qty', Math.max(1, form.qty - 1))}>−</button>
                <span>{form.qty}</span>
                <button type="button" onClick={() => set('qty', form.qty + 1)}>+</button>
              </div>
            </div>
            <div className="co-field">
              <label>Notes (optionnel)</label>
              <input value={form.notes} onChange={e => set('notes', e.target.value)}
                placeholder="Couleur, variante..." />
            </div>
          </div>
        </div>

        <div className="co-footer">
          <div className="co-total">
            <span>Total</span>
            <strong>{(product.price * form.qty)} €</strong>
          </div>
          <button className="co-submit" onClick={handleSubmit} disabled={loading}>
            {loading
              ? <><span className="co-spinner" /> Traitement en cours…</>
              : 'Passer la commande →'}
          </button>
          <p className="co-secure">🔒 Commande sécurisée · Confirmation par email</p>
        </div>

      </div>
    </div>
  )
}
