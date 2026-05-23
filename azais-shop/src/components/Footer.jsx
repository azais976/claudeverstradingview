import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <p className="footer-logo">AZAIS</p>
          <p className="footer-tagline">Style. Qualité. Authenticité.</p>
          <p className="footer-copy">© 2025 Azais Shop. Tous droits réservés.</p>
        </div>

        <div className="footer-links">
          <div className="footer-col">
            <h4>Homme</h4>
            <ul>
              <li><a href="#hauts">Hauts</a></li>
              <li><a href="#bas">Bas</a></li>
              <li><a href="#chaussures-homme">Chaussures</a></li>
              <li><a href="#ceintures">Ceintures</a></li>
              <li><a href="#sous-vetements-homme">Sous-vêtements</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Femme</h4>
            <ul>
              <li><a href="#chaussures-femme">Chaussures</a></li>
              <li><a href="#sous-vetements-femme">Sous-vêtements</a></li>
              <li><a href="#couvre-chef">Couvre-Chef</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Aide</h4>
            <ul>
              <li><a href="#">Suivi de colis</a></li>
              <li><a href="#">Livraison & Retours</a></li>
              <li><a href="#">Guide des tailles</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>Paiement sécurisé — Visa, Mastercard, PayPal, Apple Pay</p>
      </div>
    </footer>
  )
}
