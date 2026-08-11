import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.topWave} />

      <div className={`container ${styles.content}`}>
        {/* Brand */}
        <div className={styles.brand}>
          <Link to="/" className={styles.logo}>
            <span className={styles.logoIcon}>✦</span>
            <div>
              <span className={styles.logoMain}>IMO Craft</span>
              <span className={styles.logoSub}>Handmade with Love</span>
            </div>
          </Link>
          <p className={styles.tagline}>
            Crafting moments of joy, one handmade piece at a time. Every item is made with care, love, and a touch of Sri Lankan warmth.
          </p>
          <div className={styles.social}>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className={styles.socialBtn} aria-label="Facebook">
              <span>f</span>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className={styles.socialBtn} aria-label="Instagram">
              <span>📷</span>
            </a>
            <a href="https://wa.me/94XXXXXXXXX" target="_blank" rel="noopener noreferrer" className={styles.socialBtn} aria-label="WhatsApp">
              <span>💬</span>
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className={styles.socialBtn} aria-label="TikTok">
              <span>♪</span>
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className={styles.links}>
          <h4 className={styles.linkHeading}>Quick Links</h4>
          <ul>
            {[
              { to: '/', label: 'Home' },
              { to: '/shop', label: 'Shop All' },
              { to: '/about', label: 'About Us' },
              { to: '/contact', label: 'Contact' },
              { to: '/order-tracking', label: 'Track Order' },
            ].map(l => (
              <li key={l.to}>
                <Link to={l.to} className={styles.linkItem}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Categories */}
        <div className={styles.links}>
          <h4 className={styles.linkHeading}>Categories</h4>
          <ul>
            {[
              { id: 'keychains', label: 'Keychains' },
              { id: 'accessories', label: 'Accessories' },
              { id: 'gifts', label: 'Gifts' },
              { id: 'bouquets', label: 'Craft Bouquets' },
              { id: 'decor', label: 'Home Decor' },
            ].map(c => (
              <li key={c.id}>
                <Link to={`/shop?category=${c.id}`} className={styles.linkItem}>{c.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Info */}
        <div className={styles.contact}>
          <h4 className={styles.linkHeading}>Get in Touch</h4>
          <div className={styles.contactItem}>
            <span>📍</span>
            <span>Sri Lanka</span>
          </div>
          <div className={styles.contactItem}>
            <span>📞</span>
            <a href="tel:+94XXXXXXXXX" className={styles.contactLink}>+94 XXX XXX XXX</a>
          </div>
          <div className={styles.contactItem}>
            <span>✉️</span>
            <a href="mailto:hello@imocraft.lk" className={styles.contactLink}>hello@imocraft.lk</a>
          </div>
          <div className={styles.contactItem}>
            <span>⏰</span>
            <span>Mon–Sat: 9am – 7pm</span>
          </div>

          {/* WhatsApp CTA */}
          <a
            href="https://wa.me/94XXXXXXXXX?text=Hi%20IMO%20Craft!%20I%27d%20like%20to%20inquire%20about%20your%20products."
            target="_blank"
            rel="noopener noreferrer"
            className={styles.whatsappBtn}
          >
            💬 Chat on WhatsApp
          </a>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className={styles.bottomBar}>
        <div className="container">
          <div className={styles.bottomInner}>
            <p className={styles.copyright}>
              © {year} IMO Craft. All rights reserved. Made with ❤️ in Sri Lanka.
            </p>
            <div className={styles.bottomLinks}>
              <Link to="/contact" className={styles.bottomLink}>Privacy Policy</Link>
              <span>·</span>
              <Link to="/contact" className={styles.bottomLink}>Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
