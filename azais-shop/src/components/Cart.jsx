import { useCart } from '../context/CartContext'
import './Cart.css'

export default function Cart() {
  const { items, remove, update, total, count, open, setOpen } = useCart()

  return (
    <>
      <div className={`cart-backdrop${open ? ' open' : ''}`} onClick={() => setOpen(false)} />
      <aside className={`cart-drawer${open ? ' open' : ''}`}>
        <div className="cart-header">
          <h3>Panier ({count})</h3>
          <button className="cart-close" onClick={() => setOpen(false)} aria-label="Fermer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            <p>Votre panier est vide</p>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {items.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-img">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="cart-item-info">
                    <p className="cart-item-name">{item.name}</p>
                    <p className="cart-item-price">{item.price} €</p>
                    <div className="cart-item-qty">
                      <button onClick={() => update(item.id, item.qty - 1)}>−</button>
                      <span>{item.qty}</span>
                      <button onClick={() => update(item.id, item.qty + 1)}>+</button>
                    </div>
                  </div>
                  <button className="cart-item-remove" onClick={() => remove(item.id)} aria-label="Supprimer">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-footer">
              <div className="cart-total">
                <span>Total</span>
                <span>{total} €</span>
              </div>
              <button className="cart-checkout">Commander →</button>
              <p className="cart-shipping">Livraison offerte dès 80 €</p>
            </div>
          </>
        )}
      </aside>
    </>
  )
}
