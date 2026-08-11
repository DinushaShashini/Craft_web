import { useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Button from '../components/ui/Button';
import { getProductById, getRelatedProducts, products as allProducts } from '../data/products';
import styles from './ProductDetail.module.css';

// ─── helpers ──────────────────────────────────────────────────
function Stars({ rating, size = 'md' }) {
  const sizeClass = size === 'lg' ? styles.starsLg : size === 'sm' ? styles.starsSm : styles.starsMd;
  return (
    <div className={`${styles.stars} ${sizeClass}`} aria-label={`${rating} out of 5 stars`}>
      {[1,2,3,4,5].map(s => (
        <span key={s} className={s <= Math.round(rating) ? styles.starOn : styles.starOff}>★</span>
      ))}
    </div>
  );
}


function StockBadge({ stock }) {
  if (stock === 0) return <span className={`${styles.stockBadge} ${styles.stockOut}`}>Out of Stock</span>;
  if (stock <= 5)  return <span className={`${styles.stockBadge} ${styles.stockLow}`}>⚠️ Only {stock} left</span>;
  return                  <span className={`${styles.stockBadge} ${styles.stockIn}`}>✓ In Stock</span>;
}

// ─── Customization form ────────────────────────────────────────
const COLOR_OPTIONS = ['Rose Gold', 'Sky Blue', 'Lavender Purple', 'Hot Pink', 'Mint Green', 'Ocean Blue', 'Ivory White', 'Jet Black'];
const LETTER_OPTIONS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function CustomizationForm({ product, value, onChange, errors, onBlur }) {
  return (
    <div className={styles.customForm}>
      <div className={styles.customFormHeader}>
        <span className={styles.customIcon}>✏️</span>
        <div>
          <h3 className={styles.customTitle}>Personalize Your Order</h3>
          <p className={styles.customSub}>Fill in the details below – we'll craft it exactly as you specify.</p>
        </div>
      </div>

      <div className={styles.customFields}>
        {/* Name field */}
        <div className={styles.customField}>
          <label className={styles.fieldLabel} htmlFor="custom-name">
            Name / Text to engrave <span className={styles.required}>*</span>
          </label>
          <input
            id="custom-name"
            type="text"
            placeholder="e.g. Dilani, Drive Safe, My Love…"
            value={value.name}
            onChange={e => onChange('name', e.target.value)}
            onBlur={() => onBlur('name')}
            className={`${styles.fieldInput} ${errors.name ? styles.fieldError : ''}`}
            maxLength={40}
          />
          <div className={styles.fieldMeta}>
            {errors.name
              ? <span className={styles.errorMsg}>{errors.name}</span>
              : <span className={styles.charCount}>{value.name.length} / 40</span>
            }
          </div>
        </div>

        {/* Letter (for letter keychains) */}
        {(product.tags || []).includes('letter') && (
          <div className={styles.customField}>
            <label className={styles.fieldLabel} htmlFor="custom-letter">
              Initial Letter <span className={styles.required}>*</span>
            </label>
            <select
              id="custom-letter"
              value={value.letter}
              onChange={e => onChange('letter', e.target.value)}
              onBlur={() => onBlur('letter')}
              className={`${styles.fieldInput} ${errors.letter ? styles.fieldError : ''}`}
            >
              <option value="">– Choose a letter –</option>
              {LETTER_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            {errors.letter && <span className={styles.errorMsg}>{errors.letter}</span>}
          </div>
        )}

        {/* Color preference */}
        <div className={styles.customField}>
          <label className={styles.fieldLabel}>Color Preference</label>
          <div className={styles.colorGrid}>
            {COLOR_OPTIONS.map(col => (
              <button
                key={col}
                type="button"
                className={`${styles.colorChip} ${value.color === col ? styles.colorChipActive : ''}`}
                onClick={() => onChange('color', value.color === col ? '' : col)}
                aria-label={`Select color: ${col}`}
              >
                {col}
              </button>
            ))}
          </div>
        </div>

        {/* Special request */}
        <div className={styles.customField}>
          <label className={styles.fieldLabel} htmlFor="custom-request">
            Special Request <span className={styles.optional}>(optional)</span>
          </label>
          <textarea
            id="custom-request"
            placeholder="Any specific instructions, font preference, photo note, or gift message…"
            value={value.request}
            onChange={e => onChange('request', e.target.value)}
            className={styles.fieldTextarea}
            rows={3}
            maxLength={200}
          />
          <span className={styles.charCount}>{value.request.length} / 200</span>
        </div>
      </div>
    </div>
  );
}

// ─── Tabs (Description / Product Info / Delivery / Reviews) ───
const TABS = ['Description', 'Product Info', 'Delivery', 'Reviews'];

function DescriptionTab({ product }) {
  return (
    <div className={styles.tabContent}>
      <p className={styles.tabText}>{product.longDescription}</p>
      <ul className={styles.featureList}>
        <li>✦ Each piece is entirely handcrafted — no two are identical</li>
        <li>✦ Made with food-safe, non-toxic epoxy resin</li>
        <li>✦ UV-resistant coating ensures long-lasting colour</li>
        <li>✦ Inspected by hand before dispatch</li>
      </ul>
    </div>
  );
}

function ProductInfoTab({ product }) {
  const rows = [
    { label: 'Materials',     value: product.materials?.join(', ') },
    { label: 'Dimensions',    value: product.dimensions },
    { label: 'Weight',        value: product.weight },
    { label: 'Category',      value: product.category },
    { label: 'Customizable',  value: product.customizable ? 'Yes — details required at order' : 'No' },
    { label: 'Stock Status',  value: product.stock > 0 ? `${product.stock} available` : 'Out of stock' },
    { label: 'SKU',           value: `IMO-${String(product.id).padStart(4, '0')}` },
  ];
  return (
    <div className={styles.tabContent}>
      <table className={styles.infoTable}>
        <tbody>
          {rows.filter(r => r.value).map(r => (
            <tr key={r.label}>
              <td className={styles.infoLabel}>{r.label}</td>
              <td className={styles.infoValue}>{r.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DeliveryTab() {
  return (
    <div className={styles.tabContent}>
      <div className={styles.deliveryGrid}>
        {[
          { icon: '📦', title: 'Standard Delivery', desc: '3–5 business days islandwide via courier. Rs. 200 flat fee. Free on orders over Rs. 2,000.' },
          { icon: '⚡', title: 'Express Delivery', desc: '1–2 business days (Colombo & suburbs). Additional fee applies. Contact us on WhatsApp to arrange.' },
          { icon: '✏️', title: 'Custom / Made-to-Order', desc: 'Personalized items require 3–7 business days of crafting time before dispatch. You\'ll be notified when your item ships.' },
          { icon: '📫', title: 'Order Tracking', desc: 'Track your order anytime via our Order Tracking page using your order number (sent to your email).' },
        ].map(item => (
          <div key={item.title} className={styles.deliveryCard}>
            <span className={styles.deliveryIcon}>{item.icon}</span>
            <h4 className={styles.deliveryTitle}>{item.title}</h4>
            <p className={styles.deliveryDesc}>{item.desc}</p>
          </div>
        ))}
      </div>
      <div className={styles.deliveryNote}>
        <strong>💝 Packaging:</strong> All orders are gift-wrapped in our signature IMO Craft box with a handwritten thank-you note — no extra charge!
      </div>
    </div>
  );
}

// Simulated review data
const MOCK_REVIEWS = [
  { id: 1, name: 'Dilani P.', location: 'Colombo', rating: 5, date: '2026-07-15', text: `Absolutely stunning! The seashells inside look so real. Perfect gift for my sister's birthday. Even the packaging was beautiful.` },
  { id: 2, name: 'Kasun F.', location: 'Kandy',   rating: 5, date: '2026-06-28', text: `Got this as a personalized "Drive Safe" keychain for my dad. He loved it! Quality is excellent and arrived well-packaged.` },
  { id: 3, name: 'Nimasha R.', location: 'Galle', rating: 4, date: '2026-06-10', text: `Very pretty item. Took about 5 days to arrive but the craftsmanship is worth the wait. Slightly smaller than I imagined but still gorgeous.` },
];

function ReviewsTab({ product }) {
  const avg = product.rating;
  const dist = [5, 4, 3, 2, 1].map(s => ({
    star: s,
    pct: s === 5 ? 68 : s === 4 ? 20 : s === 3 ? 8 : s === 2 ? 3 : 1,
  }));

  return (
    <div className={styles.tabContent}>
      {/* Summary */}
      <div className={styles.reviewSummary}>
        <div className={styles.reviewAvgBox}>
          <span className={styles.reviewAvg}>{avg.toFixed(1)}</span>
          <Stars rating={avg} size="lg" />
          <span className={styles.reviewTotal}>{product.reviews} reviews</span>
        </div>
        <div className={styles.reviewBars}>
          {dist.map(d => (
            <div key={d.star} className={styles.reviewBarRow}>
              <span className={styles.reviewBarLabel}>{d.star} ★</span>
              <div className={styles.reviewBarTrack}>
                <div className={styles.reviewBarFill} style={{ width: `${d.pct}%` }} />
              </div>
              <span className={styles.reviewBarPct}>{d.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Individual reviews */}
      <div className={styles.reviewList}>
        {MOCK_REVIEWS.map(r => (
          <div key={r.id} className={styles.reviewCard}>
            <div className={styles.reviewHeader}>
              <div className={styles.reviewAvatar}>{r.name[0]}</div>
              <div className={styles.reviewMeta}>
                <strong className={styles.reviewName}>{r.name}</strong>
                <span className={styles.reviewLoc}>📍 {r.location}</span>
              </div>
              <div className={styles.reviewRight}>
                <Stars rating={r.rating} size="sm" />
                <span className={styles.reviewDate}>{new Date(r.date).toLocaleDateString('en-LK', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>
            <p className={styles.reviewText}>{r.text}</p>
          </div>
        ))}
      </div>

      <div className={styles.reviewCta}>
        <p>Purchased this item? Share your experience!</p>
        <a
          href="https://wa.me/94XXXXXXXXX?text=Hi!%20I'd%20like%20to%20leave%20a%20review%20for%20my%20order."
          target="_blank" rel="noopener noreferrer"
          className={styles.reviewCtaBtn}
        >💬 Send Review via WhatsApp</a>
      </div>
    </div>
  );
}

// ─── Related product mini-card ────────────────────────────────
function RelatedCard({ product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const handleAdd = (e) => {
    e.preventDefault();
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };
  return (
    <Link to={`/product/${product.id}`} className={styles.relCard}>
      <div className={styles.relImgBox}>
        <img src={product.images[0]} alt={product.name} className={styles.relImg} loading="lazy" />
        <button
          className={`${styles.relAddBtn} ${added ? styles.relAddBtnDone : ''}`}
          onClick={handleAdd}
          aria-label={`Add ${product.name} to cart`}
        >
          {added ? '✓' : '+'}
        </button>
      </div>
      <div className={styles.relBody}>
        <span className={styles.relCategory}>{product.category}</span>
        <h4 className={styles.relName}>{product.name}</h4>
        <div className={styles.relFooter}>
          <Stars rating={product.rating} size="sm" />
          <span className={styles.relPrice}>Rs. {product.price.toLocaleString()}</span>
        </div>
      </div>
    </Link>
  );
}

// ─── Main component ───────────────────────────────────────────
export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const product = getProductById(id);

  const [selectedImage, setSelectedImage]   = useState(0);
  const [quantity, setQuantity]             = useState(1);
  const [activeTab, setActiveTab]           = useState('Description');
  const [added, setAdded]                   = useState(false);
  const [wishlist, setWishlist]             = useState(false);
  const [zoom, setZoom]                     = useState(false);
  const [zoomPos, setZoomPos]               = useState({ x: 50, y: 50 });
  const imgRef = useRef(null);

  // Customization form state
  const [custom, setCustom] = useState({ name: '', letter: '', color: '', request: '' });
  const [customErrors, setCustomErrors]     = useState({});
  const [customTouched, setCustomTouched]   = useState({});

  if (!product) {
    return (
      <main className={styles.notFoundPage}>
        <div className="container">
          <div className={styles.notFoundInner}>
            <span className={styles.notFoundIcon}>😕</span>
            <h1>Product Not Found</h1>
            <p>This product doesn't exist or may have been removed.</p>
            <Button variant="primary" onClick={() => navigate('/shop')}>Browse Shop</Button>
          </div>
        </div>
      </main>
    );
  }

  const related = getRelatedProducts(product, 4);
  const others  = allProducts.filter(p => p.id !== product.id).slice(0, 4);
  const relatedToShow = related.length >= 2 ? related : others;

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const handleCustomChange = (field, val) => {
    setCustom(prev => ({ ...prev, [field]: val }));
    if (customErrors[field]) validateField(field, val);
  };

  const validateField = (field, val = custom[field]) => {
    let err = '';
    if (field === 'name' && product.customizable && !val.trim()) err = 'Please enter a name or text to engrave.';
    if (field === 'letter' && (product.tags||[]).includes('letter') && !val) err = 'Please choose a letter.';
    setCustomErrors(prev => ({ ...prev, [field]: err }));
    return !err;
  };

  const handleBlur = (field) => {
    setCustomTouched(prev => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const validateAll = () => {
    const fields = ['name'];
    if ((product.tags||[]).includes('letter')) fields.push('letter');
    let valid = true;
    const newErrors = {};
    fields.forEach(f => {
      if (!validateField(f)) { valid = false; newErrors[f] = customErrors[f] || 'Required'; }
    });
    if (!valid) setCustomErrors(prev => ({ ...prev, ...newErrors }));
    return valid;
  };

  const buildCustomNote = () => {
    const parts = [];
    if (custom.name)    parts.push(`Name: ${custom.name}`);
    if (custom.letter)  parts.push(`Letter: ${custom.letter}`);
    if (custom.color)   parts.push(`Color: ${custom.color}`);
    if (custom.request) parts.push(`Request: ${custom.request}`);
    return parts.join(' | ');
  };

  const handleAddToCart = () => {
    if (product.customizable && !validateAll()) return;
    addToCart(product, quantity, buildCustomNote());
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  const handleBuyNow = () => {
    if (product.customizable && !validateAll()) return;
    addToCart(product, quantity, buildCustomNote());
    navigate('/checkout');
  };

  // Image zoom on hover
  const handleMouseMove = (e) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width)  * 100;
    const y = ((e.clientY - rect.top)  / rect.height) * 100;
    setZoomPos({ x, y });
  };

  return (
    <main className={styles.page}>

      {/* Breadcrumb */}
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <div className="container">
          <ol className={styles.breadcrumbList}>
            <li><Link to="/">Home</Link></li>
            <li aria-hidden>›</li>
            <li><Link to="/shop">Shop</Link></li>
            <li aria-hidden>›</li>
            <li><Link to={`/shop?category=${product.category}`}>{product.category}</Link></li>
            <li aria-hidden>›</li>
            <li aria-current="page">{product.name}</li>
          </ol>
        </div>
      </nav>

      {/* ── Hero: image + info ── */}
      <section className={styles.heroSection}>
        <div className="container">
          <div className={styles.heroGrid}>

            {/* ── LEFT: Image Gallery ── */}
            <div className={styles.gallery}>

              {/* Thumbnails – vertical strip */}
              {product.images.length > 1 && (
                <div className={styles.thumbStrip}>
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      className={`${styles.thumb} ${i === selectedImage ? styles.thumbActive : ''}`}
                      onClick={() => setSelectedImage(i)}
                      aria-label={`View image ${i + 1}`}
                    >
                      <img src={img} alt={`${product.name} ${i + 1}`} />
                    </button>
                  ))}
                </div>
              )}

              {/* Main image with zoom */}
              <div
                className={`${styles.mainImageBox} ${zoom ? styles.zoomed : ''}`}
                onMouseEnter={() => setZoom(true)}
                onMouseLeave={() => setZoom(false)}
                onMouseMove={handleMouseMove}
              >
                <img
                  ref={imgRef}
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className={styles.mainImg}
                  style={zoom
                    ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`, transform: 'scale(1.8)' }
                    : {}
                  }
                  draggable={false}
                />

                {/* Badge overlay */}
                <div className={styles.imgBadges}>
                  {product.isBestseller && <span className={`${styles.imgBadge} ${styles.badgePop}`}>🔥 Popular</span>}
                  {product.isNew        && <span className={`${styles.imgBadge} ${styles.badgeNew}`}>✨ New</span>}
                  {discount             && <span className={`${styles.imgBadge} ${styles.badgeSale}`}>-{discount}%</span>}
                </div>

                {/* Zoom hint */}
                {!zoom && (
                  <div className={styles.zoomHint}>🔍 Hover to zoom</div>
                )}
              </div>
            </div>

            {/* ── RIGHT: Product Info ── */}
            <div className={styles.info}>

              {/* Category + wishlist row */}
              <div className={styles.topRow}>
                <Link to={`/shop?category=${product.category}`} className={styles.catTag}>
                  {product.category}
                </Link>
                <button
                  className={`${styles.wishBtn} ${wishlist ? styles.wishActive : ''}`}
                  onClick={() => setWishlist(w => !w)}
                  aria-label={wishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  {wishlist ? '♥' : '♡'} {wishlist ? 'Wishlisted' : 'Add to Wishlist'}
                </button>
              </div>

              <h1 className={styles.productName}>{product.name}</h1>

              {/* Rating row */}
              <div className={styles.ratingRow}>
                <Stars rating={product.rating} size="md" />
                <span className={styles.ratingVal}>{product.rating.toFixed(1)}</span>
                <span className={styles.ratingCount}>({product.reviews} reviews)</span>
                <button
                  className={styles.ratingLink}
                  onClick={() => setActiveTab('Reviews')}
                >
                  See all reviews ↓
                </button>
              </div>

              {/* Price block */}
              <div className={styles.priceBlock}>
                <span className={styles.price}>Rs. {product.price.toLocaleString()}</span>
                {product.originalPrice && (
                  <span className={styles.originalPrice}>Rs. {product.originalPrice.toLocaleString()}</span>
                )}
                {discount && <span className={styles.discountBadge}>Save {discount}%</span>}
              </div>

              {/* Stock */}
              <StockBadge stock={product.stock} />

              {/* Short description */}
              <p className={styles.shortDesc}>{product.description}</p>

              {/* Tags */}
              <div className={styles.tags}>
                {(product.tags || []).map(tag => (
                  <span key={tag} className={styles.tag}>{tag}</span>
                ))}
              </div>

              <div className={styles.divider} />

              {/* ── Customization form ── */}
              {product.customizable && (
                <CustomizationForm
                  product={product}
                  value={custom}
                  onChange={handleCustomChange}
                  errors={customErrors}
                  onBlur={handleBlur}
                />
              )}

              {/* ── Quantity ── */}
              <div className={styles.qtyRow}>
                <span className={styles.qtyLabel}>Quantity</span>
                <div className={styles.qtyControl}>
                  <button
                    className={styles.qtyBtn}
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    aria-label="Decrease"
                  >−</button>
                  <span className={styles.qtyVal}>{quantity}</span>
                  <button
                    className={styles.qtyBtn}
                    onClick={() => setQuantity(q => Math.min(product.stock || 99, q + 1))}
                    disabled={quantity >= (product.stock || 99)}
                    aria-label="Increase"
                  >+</button>
                </div>
                {product.stock > 0 && product.stock <= 10 && (
                  <span className={styles.qtyStock}>Only {product.stock} left!</span>
                )}
              </div>

              {/* ── Action buttons ── */}
              <div className={styles.actions}>
                <button
                  className={`${styles.addCartBtn} ${added ? styles.addCartAdded : ''}`}
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                >
                  {added ? '✓ Added to Cart!' : '🛒 Add to Cart'}
                </button>
                <button
                  className={styles.buyNowBtn}
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                >
                  ⚡ Buy Now
                </button>
              </div>

              {/* WhatsApp */}
              <a
                href={`https://wa.me/94XXXXXXXXX?text=Hi!%20I'm%20interested%20in:%20${encodeURIComponent(product.name)}%20(Rs.%20${product.price})${custom.name ? `%0ACustomization:%20${encodeURIComponent(buildCustomNote())}` : ''}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.whatsappBtn}
              >
                <span>💬</span> Inquire via WhatsApp
              </a>

              {/* Trust badges */}
              <div className={styles.trustRow}>
                {['🔒 Secure Checkout', '🚚 Fast Delivery', '💝 Gift Wrapped', '✅ Quality Checked'].map(b => (
                  <span key={b} className={styles.trustBadge}>{b}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tabs: Description / Product Info / Delivery / Reviews ── */}
      <section className={styles.tabsSection}>
        <div className="container">
          <div className={styles.tabBar} role="tablist">
            {TABS.map(tab => (
              <button
                key={tab}
                role="tab"
                aria-selected={activeTab === tab}
                className={`${styles.tabBtn} ${activeTab === tab ? styles.tabBtnActive : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
                {tab === 'Reviews' && (
                  <span className={styles.tabBadge}>{product.reviews}</span>
                )}
              </button>
            ))}
          </div>

          <div className={styles.tabPanel} role="tabpanel" aria-label={activeTab}>
            {activeTab === 'Description'   && <DescriptionTab  product={product} />}
            {activeTab === 'Product Info'  && <ProductInfoTab  product={product} />}
            {activeTab === 'Delivery'      && <DeliveryTab />}
            {activeTab === 'Reviews'       && <ReviewsTab product={product} />}
          </div>
        </div>
      </section>

      {/* ── Related Products ── */}
      {relatedToShow.length > 0 && (
        <section className={styles.relatedSection}>
          <div className="container">
            <div className="section-header">
              <span className="section-tag">You May Also Like</span>
              <h2 className="section-title">Related Products</h2>
              <div className="divider" />
            </div>
            <div className={styles.relatedGrid}>
              {relatedToShow.map(p => (
                <RelatedCard key={p.id} product={p} />
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <Button variant="secondary" onClick={() => navigate('/shop')}>
                View All Products →
              </Button>
            </div>
          </div>
        </section>
      )}

    </main>
  );
}
