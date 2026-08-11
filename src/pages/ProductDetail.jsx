import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import ProductGrid from '../components/product/ProductGrid';
import Button from '../components/ui/Button';
import { getProductById, getRelatedProducts } from '../data/products';
import styles from './ProductDetail.module.css';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const product = getProductById(id);

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [customization, setCustomization] = useState('');
  const [added, setAdded] = useState(false);

  if (!product) {
    return (
      <main className={styles.notFound}>
        <div className="container">
          <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
            <span style={{ fontSize: '4rem' }}>😕</span>
            <h1 className="heading-lg" style={{ margin: '1rem 0' }}>Product Not Found</h1>
            <p className="text-muted">This product doesn't exist or may have been removed.</p>
            <div style={{ marginTop: '2rem' }}>
              <Button variant="primary" onClick={() => navigate('/shop')}>Browse Shop</Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const related = getRelatedProducts(product, 4);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const handleAddToCart = () => {
    addToCart(product, quantity, customization);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <main>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <div className="container">
          <Link to="/">Home</Link>
          <span>›</span>
          <Link to="/shop">Shop</Link>
          <span>›</span>
          <Link to={`/shop?category=${product.category}`}>{product.category}</Link>
          <span>›</span>
          <span>{product.name}</span>
        </div>
      </div>

      <div className="container">
        <div className={styles.productLayout}>
          {/* Image Gallery */}
          <div className={styles.gallery}>
            <div className={styles.mainImage}>
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className={styles.mainImg}
              />
              {discount && (
                <div className={styles.discountBadge}>-{discount}%</div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className={styles.thumbnails}>
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    className={`${styles.thumb} ${i === selectedImage ? styles.thumbActive : ''}`}
                    onClick={() => setSelectedImage(i)}
                    aria-label={`View image ${i + 1}`}
                  >
                    <img src={img} alt={`${product.name} view ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className={styles.info}>
            <div className={styles.categoryTag}>{product.category}</div>
            <h1 className={styles.productName}>{product.name}</h1>

            {/* Rating */}
            <div className={styles.ratingRow}>
              <div className={styles.stars}>
                {[1,2,3,4,5].map(s => (
                  <span key={s} className={s <= Math.round(product.rating) ? styles.starOn : styles.starOff}>★</span>
                ))}
              </div>
              <span className={styles.ratingText}>{product.rating} ({product.reviews} reviews)</span>
            </div>

            {/* Pricing */}
            <div className={styles.pricing}>
              <span className={styles.price}>Rs. {product.price.toLocaleString()}</span>
              {product.originalPrice && (
                <span className={styles.originalPrice}>Rs. {product.originalPrice.toLocaleString()}</span>
              )}
              {discount && <span className={styles.saveBadge}>Save {discount}%</span>}
            </div>

            <p className={styles.description}>{product.longDescription}</p>

            {/* Tags */}
            <div className={styles.tags}>
              {product.tags.map(tag => (
                <span key={tag} className={styles.tag}>{tag}</span>
              ))}
            </div>

            {/* Customization */}
            {product.customizable && (
              <div className={styles.customSection}>
                <label className={styles.customLabel}>✏️ Customization Note (optional)</label>
                <textarea
                  className={styles.customInput}
                  placeholder="e.g. Name: Dilani, Color: Pink, Size: Medium..."
                  value={customization}
                  onChange={e => setCustomization(e.target.value)}
                  rows={3}
                  id="customization-note"
                />
              </div>
            )}

            {/* Quantity */}
            <div className={styles.quantityRow}>
              <label className={styles.quantityLabel}>Quantity:</label>
              <div className={styles.quantityControl}>
                <button
                  className={styles.qtyBtn}
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >−</button>
                <span className={styles.qtyValue}>{quantity}</span>
                <button
                  className={styles.qtyBtn}
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  aria-label="Increase quantity"
                >+</button>
              </div>
              <span className={styles.stockInfo}>
                {product.stock > 5 ? `${product.stock} in stock` : `⚠️ Only ${product.stock} left!`}
              </span>
            </div>

            {/* Actions */}
            <div className={styles.actions}>
              <Button
                variant="primary"
                size="lg"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                style={{ flex: 2 }}
              >
                {added ? '✓ Added to Cart!' : '🛒 Add to Cart'}
              </Button>
              <Button
                variant="gold"
                size="lg"
                onClick={() => {
                  addToCart(product, quantity, customization);
                  navigate('/checkout');
                }}
                disabled={product.stock === 0}
                style={{ flex: 1 }}
              >
                Buy Now
              </Button>
            </div>

            {/* WhatsApp */}
            <a
              href={`https://wa.me/94XXXXXXXXX?text=Hi!%20I'm%20interested%20in%20${encodeURIComponent(product.name)}%20(Rs.%20${product.price}).`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.whatsappLink}
            >
              💬 Inquire on WhatsApp
            </a>

            {/* Product Details */}
            <div className={styles.detailsCard}>
              <h3 className={styles.detailsTitle}>Product Details</h3>
              <table className={styles.detailsTable}>
                <tbody>
                  <tr><td>Materials</td><td>{product.materials.join(', ')}</td></tr>
                  <tr><td>Dimensions</td><td>{product.dimensions}</td></tr>
                  <tr><td>Weight</td><td>{product.weight}</td></tr>
                  <tr><td>Customizable</td><td>{product.customizable ? 'Yes ✓' : 'No'}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section className={styles.related}>
            <div className="section-header">
              <span className="section-tag">You May Also Like</span>
              <h2 className="section-title">Related Products</h2>
              <div className="divider" />
            </div>
            <ProductGrid products={related} columns={4} />
          </section>
        )}
      </div>
    </main>
  );
}
