import { useState, useEffect } from 'react'
import './ExternalOrderModal.css'

const WHATSAPP_URL = 'https://wa.me/85252296088'

export default function ExternalOrderModal({ open, onClose, product }) {
  const [iframeBlocked, setIframeBlocked] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (open) {
      setIframeBlocked(false)
      setLoaded(false)
      // Detect X-Frame-Options block after timeout
      const timer = setTimeout(() => {
        if (!loaded) setIframeBlocked(true)
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [open])

  useEffect(() => {
    const handleKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  if (!open) return null

  return (
    <div className="ext-backdrop" onClick={onClose}>
      <div className="ext-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ext-header">
          <div className="ext-header-left">
            <div className="ext-logo-dot" />
            <div>
              <p className="ext-title">Commander via Airtn.fr</p>
              {product && <p className="ext-subtitle">{product.name}</p>}
            </div>
          </div>
          <button className="ext-close" onClick={onClose} aria-label="Fermer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="ext-body">
          {iframeBlocked ? (
            <div className="ext-blocked">
              <div className="ext-blocked-icon">🔒</div>
              <h3>Le site bloque l'intégration</h3>
              <p>
                Airtn.fr ne permet pas d'être affiché dans un cadre.<br />
                Contactez-les directement via WhatsApp pour commander.
              </p>
              {product && (
                <div className="ext-product-ref">
                  <img src={product.image} alt={product.name} />
                  <span>{product.name}</span>
                </div>
              )}
              <div className="ext-blocked-actions">
                <a
                  href={`${WHATSAPP_URL}?text=${encodeURIComponent(`Bonjour, je souhaite commander : ${product?.name ?? 'une paire de Nike Air TN'}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Commander sur WhatsApp
                </a>
                <a href="https://www.airtn.fr/" target="_blank" rel="noopener noreferrer" className="btn-visit">
                  Visiter Airtn.fr →
                </a>
              </div>
            </div>
          ) : (
            <>
              {!loaded && (
                <div className="ext-loading">
                  <div className="ext-spinner" />
                  <p>Chargement d'Airtn.fr…</p>
                </div>
              )}
              <iframe
                src="https://www.airtn.fr/"
                title="Airtn.fr — Commander"
                className={`ext-iframe${loaded ? ' visible' : ''}`}
                onLoad={() => setLoaded(true)}
                onError={() => setIframeBlocked(true)}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
