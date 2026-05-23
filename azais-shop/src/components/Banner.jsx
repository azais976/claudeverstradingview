import './Banner.css'

export default function Banner() {
  return (
    <section className="banner fade-in">
      <div className="banner-inner">
        <div className="banner-text">
          <p className="banner-eyebrow">Offre exclusive</p>
          <h2 className="banner-title">Livraison offerte<br />dès 80 € d'achat</h2>
          <p className="banner-desc">
            Profitez de la livraison gratuite en France métropolitaine pour toute commande supérieure à 80 €.
          </p>
          <button className="btn-primary banner-btn">
            J'en profite
          </button>
        </div>
        <div className="banner-visual">
          <div className="banner-circles">
            <div className="bc bc-1" />
            <div className="bc bc-2" />
            <div className="bc bc-3" />
          </div>
          <div className="banner-badge">
            <span className="badge-pct">-20%</span>
            <span className="badge-sub">sur votre 1ère commande</span>
          </div>
        </div>
      </div>
    </section>
  )
}
