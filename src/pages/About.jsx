import { Link } from 'react-router-dom';
import styles from './About.module.css';

const values = [
  { icon: '🤝', title: 'Made with Intention', desc: 'Every item is thoughtfully crafted with purpose and meaning, not mass-produced.' },
  { icon: '🌿', title: 'Eco-Conscious', desc: 'We use sustainable materials and eco-friendly packaging to reduce our footprint.' },
  { icon: '💎', title: 'Quality First', desc: 'We never compromise on quality. Each piece is inspected before leaving our hands.' },
  { icon: '💌', title: 'Personalized Service', desc: 'Every order gets personal attention. We\'re always here to help and customize.' },
];

const team = [
  {
    name: 'Imasha',
    role: 'Founder & Lead Artisan',
    bio: 'The heart behind IMO Craft. Imasha began crafting as a hobby and turned her passion into a business that brings joy to hundreds of customers.',
    emoji: '👩‍🎨',
    color: '#C9785A',
  },
];

export default function About() {
  return (
    <main>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroContent}>
            <span className="section-tag">Our Story</span>
            <h1 className={styles.heroTitle}>Crafted with Love,<br />Made in Sri Lanka</h1>
            <p className={styles.heroText}>
              IMO Craft was born from a simple belief: that handmade things carry a special energy that mass-produced items can never replicate. Every stitch, knot, and resin pour is done by hand — and that makes all the difference.
            </p>
            <div className={styles.heroBtns}>
              <Link to="/shop" className={styles.heroBtn}>Explore Our Shop</Link>
              <Link to="/contact" className={styles.heroBtnSecondary}>Get in Touch</Link>
            </div>
          </div>
          <div className={styles.heroImages}>
            <img
              src="/images/products/ocean-round-resin-keychain.jpg"
              alt="IMO Craft handmade ocean resin keychains"
              className={styles.heroImg}
            />
            <div className={styles.heroImageBadge}>
              <span>✦</span>
              <span>Handmade</span>
              <span>with Love</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className={styles.statsSection}>
        <div className="container">
          <div className={styles.statsGrid}>
            {[
              { num: '500+', label: 'Happy Customers' },
              { num: '3+', label: 'Years of Crafting' },
              { num: '50+', label: 'Unique Products' },
              { num: '100%', label: 'Handmade' },
            ].map(s => (
              <div key={s.label} className={styles.statItem}>
                <span className={styles.statNum}>{s.num}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className={`section ${styles.storySection}`}>
        <div className="container">
          <div className={styles.storyGrid}>
            <div className={styles.storyContent}>
              <span className="section-tag">How It Began</span>
              <h2 className={styles.storyTitle}>From a Hobby to a Heartfelt Business</h2>
              <p>IMO Craft started in 2022 as a creative outlet — a way to unwind and make beautiful things. What began as handmade keychains gifted to friends soon turned into something much bigger.</p>
              <p>As word spread about the quality and uniqueness of each piece, requests started coming in from all over Sri Lanka. Today, IMO Craft serves hundreds of customers, creating personalized gifts, accessories, and décor that carry a little piece of our heart.</p>
              <p>Every order is still handled personally — because we believe that's the only way to ensure that what you receive is truly special.</p>
            </div>
            <div className={styles.storyImages}>
              <img
                src="/images/products/ocean-letter-keychain.jpg"
                alt="IMO Craft letter keychains handmade process"
                className={styles.storyImg1}
              />
              <img
                src="/images/products/glitter-letter-keychain.jpg"
                alt="IMO Craft glitter letter keychains finished products"
                className={styles.storyImg2}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className={`section ${styles.valuesSection}`}>
        <div className="container">
          <div className="section-header">
            <span className="section-tag">What We Stand For</span>
            <h2 className="section-title">Our Values</h2>
            <div className="divider" />
          </div>
          <div className={styles.valuesGrid}>
            {values.map(v => (
              <div key={v.title} className={styles.valueCard}>
                <span className={styles.valueIcon}>{v.icon}</span>
                <h3 className={styles.valueTitle}>{v.title}</h3>
                <p className={styles.valueDesc}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet the Artisan */}
      <section className={`section ${styles.teamSection}`}>
        <div className="container">
          <div className="section-header">
            <span className="section-tag">The Person Behind the Craft</span>
            <h2 className="section-title">Meet Our Artisan</h2>
            <div className="divider" />
          </div>
          <div className={styles.teamGrid}>
            {team.map(member => (
              <div key={member.name} className={styles.teamCard}>
                <div className={styles.teamAvatar} style={{ background: `linear-gradient(135deg, ${member.color}, ${member.color}88)` }}>
                  <span>{member.emoji}</span>
                </div>
                <h3 className={styles.teamName}>{member.name}</h3>
                <p className={styles.teamRole}>{member.role}</p>
                <p className={styles.teamBio}>{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <div className="container">
          <div className={styles.ctaCard}>
            <span className={styles.ctaTag}>Start Your Craft Journey</span>
            <h2 className={styles.ctaTitle}>Ready to Find Your Perfect Handmade Piece?</h2>
            <p className={styles.ctaText}>Browse our full collection or reach out for a custom order — we'd love to make something special just for you.</p>
            <div className={styles.ctaBtns}>
              <Link to="/shop" className={styles.ctaBtn}>Shop Now</Link>
              <Link to="/contact" className={styles.ctaBtnSecondary}>Contact Us</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
