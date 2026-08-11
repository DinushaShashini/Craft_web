import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ProductGrid from '../components/product/ProductGrid';
import CategoryCard from '../components/product/CategoryCard';
import Button from '../components/ui/Button';
import { products, categories, testimonials, getBestsellerProducts, getFeaturedProducts } from '../data/products';
import styles from './Home.module.css';

function HeroSection() {
  const [current, setCurrent] = useState(0);
  const slides = [
    {
      tag: 'Handmade with Love',
      title: 'Ocean Resin Keychains, Crafted for You',
      sub: 'Real seashells, gold jellyfish, and ocean-blue resin — each keychain is a tiny world of its own, made by hand in Sri Lanka.',
      cta: 'Shop Keychains',
      link: '/shop?category=keychains',
      bg: '/images/products/personalized-rect-keychain.jpg',
    },
    {
      tag: 'Personalized Orders Welcome',
      title: 'Your Name, Your Story — In Resin',
      sub: 'Personalized keychains, glitter pens, and resin photo frames handcrafted with your name, message, or photo. Perfect for gifting.',
      cta: 'See Personalized Items',
      link: '/shop',
      bg: '/images/products/glitter-letter-keychain.jpg',
    },
    {
      tag: 'Unique Gifts for Every Occasion',
      title: 'A Photo Frame Like No Other',
      sub: 'Our circular resin photo frames with real dried flowers and shells are a heartfelt, timeless keepsake for the people you love.',
      cta: 'Explore Gifts',
      link: '/shop?category=gifts',
      bg: '/images/products/resin-photo-frame.jpg',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => setCurrent(c => (c + 1) % slides.length), 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className={styles.hero} aria-label="Featured banners">
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`${styles.heroSlide} ${i === current ? styles.heroSlideActive : ''}`}
          style={{ backgroundImage: `url(${slide.bg})` }}
          aria-hidden={i !== current}
        >
          <div className={styles.heroOverlay} />
          <div className={`container ${styles.heroContent}`}>
            <span className={styles.heroTag}>{slide.tag}</span>
            <h1 className={styles.heroTitle}>{slide.title}</h1>
            <p className={styles.heroSub}>{slide.sub}</p>
            <div className={styles.heroCtas}>
              <Button variant="primary" size="lg">
                <Link to={slide.link} style={{ color: 'inherit' }}>{slide.cta}</Link>
              </Button>
              <Button variant="ghost" size="lg">
                <Link to="/about" style={{ color: 'inherit' }}>Our Story</Link>
              </Button>
            </div>
          </div>
        </div>
      ))}

      {/* Dots */}
      <div className={styles.heroDots}>
        {slides.map((_, i) => (
          <button
            key={i}
            className={`${styles.heroDot} ${i === current ? styles.heroDotActive : ''}`}
            onClick={() => setCurrent(i)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Scroll hint */}
      <div className={styles.scrollHint}>
        <span>Scroll to explore</span>
        <div className={styles.scrollArrow} />
      </div>
    </section>
  );
}

function StatsBar() {
  const stats = [
    { value: '500+', label: 'Happy Customers' },
    { value: '100%', label: 'Handmade' },
    { value: '50+', label: 'Unique Products' },
    { value: '5★', label: 'Average Rating' },
  ];
  return (
    <div className={styles.statsBar}>
      <div className="container">
        <div className={styles.statsGrid}>
          {stats.map(s => (
            <div key={s.label} className={styles.statItem}>
              <strong className={styles.statValue}>{s.value}</strong>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TestimonialsSection() {
  const [active, setActive] = useState(0);

  return (
    <section className={`${styles.testimonials} section`}>
      <div className="container">
        <div className="section-header">
          <span className="section-tag">What Customers Say</span>
          <h2 className="section-title">Loved by People Across Sri Lanka</h2>
          <div className="divider" />
        </div>

        <div className={styles.testimonialCards}>
          {testimonials.map((t, i) => (
            <div
              key={t.id}
              className={`${styles.testimonialCard} ${i === active ? styles.testimonialActive : ''}`}
              onClick={() => setActive(i)}
            >
              <div className={styles.testimonialStars}>
                {'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}
              </div>
              <p className={styles.testimonialText}>"{t.comment}"</p>
              <div className={styles.testimonialAuthor}>
                <div className={styles.testimonialAvatar}>{t.avatar}</div>
                <div>
                  <strong>{t.name}</strong>
                  <span>{t.location} · {t.product}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTABanner() {
  return (
    <section className={styles.ctaBanner}>
      <div className="container">
        <div className={styles.ctaInner}>
          <div className={styles.ctaText}>
            <span className={styles.ctaTag}>✦ Personalized Orders Welcome</span>
            <h2 className={styles.ctaTitle}>Can't Find What You're Looking For?</h2>
            <p className={styles.ctaSub}>We love creating custom pieces! Message us on WhatsApp with your idea and we'll bring it to life.</p>
          </div>
          <div className={styles.ctaActions}>
            <a
              href="https://wa.me/94XXXXXXXXX?text=Hi!%20I'd%20like%20a%20custom%20order."
              target="_blank"
              rel="noopener noreferrer"
              className={styles.ctaWhatsapp}
            >
              💬 Custom Order on WhatsApp
            </a>
            <Button variant="secondary" size="lg">
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const bestsellers = getBestsellerProducts().slice(0, 8);
  const featured = getFeaturedProducts().slice(0, 4);

  return (
    <main>
      <HeroSection />
      <StatsBar />

      {/* Categories */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Browse by Type</span>
            <h2 className="section-title">Our Categories</h2>
            <p className="section-subtitle">From keychains to bouquets — find handmade treasures for every occasion.</p>
            <div className="divider" />
          </div>
          <div className={styles.categoriesGrid}>
            {categories.map(cat => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </div>
      </section>

      {/* Bestsellers */}
      <section className={`section ${styles.bestsellersSection}`}>
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Most Loved</span>
            <h2 className="section-title">Bestsellers ✦</h2>
            <p className="section-subtitle">Handpicked favorites that our customers can't get enough of.</p>
            <div className="divider" />
          </div>
          <ProductGrid products={bestsellers} columns={4} />
          <div className={styles.viewAllWrap}>
            <Button variant="secondary" size="lg">
              <Link to="/shop">View All Products</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* About Snippet */}
      <section className={`section ${styles.aboutSnippet}`}>
        <div className="container">
          <div className={styles.aboutGrid}>
            <div className={styles.aboutImages}>
              <img
                src="/images/products/ocean-round-resin-keychain.jpg"
                alt="IMO Craft ocean resin keychains handmade"
                className={styles.aboutImg1}
              />
              <img
                src="/images/products/personalized-rect-keychain.jpg"
                alt="Personalized IMO Craft keychains"
                className={styles.aboutImg2}
              />
              <div className={styles.aboutBadge}>
                <span className={styles.aboutBadgeNum}>3+</span>
                <span className={styles.aboutBadgeLabel}>Years of Crafting</span>
              </div>
            </div>
            <div className={styles.aboutContent}>
              <span className="section-tag">Our Story</span>
              <h2 className={styles.aboutTitle}>Made with Hands,<br />Crafted with Heart</h2>
              <p className={styles.aboutText}>
                IMO Craft began as a small passion project — a love for turning simple materials into beautiful, meaningful pieces. Every item in our shop is hand-crafted with care and attention, ensuring each piece tells its own unique story.
              </p>
              <p className={styles.aboutText}>
                Based in Sri Lanka, we pour our cultural warmth and creativity into everything we make — from delicate resin keychains to stunning craft bouquets that last forever.
              </p>
              <div className={styles.aboutValues}>
                {['100% Handmade', 'Eco-Friendly Materials', 'Customizable Orders', 'Fast Delivery'].map(v => (
                  <span key={v} className={styles.aboutValue}>✓ {v}</span>
                ))}
              </div>
              <Button variant="primary" size="lg">
                <Link to="/about" style={{ color: 'inherit' }}>Read Our Story</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Handpicked for You</span>
            <h2 className="section-title">Featured Pieces</h2>
            <div className="divider" />
          </div>
          <ProductGrid products={featured} columns={4} />
        </div>
      </section>

      <TestimonialsSection />
      <CTABanner />
    </main>
  );
}
