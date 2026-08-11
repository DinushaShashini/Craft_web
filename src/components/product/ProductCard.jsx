import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import styles from './ProductCard.module.css';

function StarRating({ rating }) {
  return (
    <div className={styles.stars} aria-label={`Rating: ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          className={star <= Math.round(rating) ? styles.starFilled : styles.starEmpty}
        >★</span>
      ))}
      <span className={styles.ratingValue}>{rating.toFixed(1)}</span>
    </div>
  );
}

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  return (
    <article className={styles.card}>
      <Link to={`/product/${product.id}`} className={styles.imageWrapper}>
        <img
          src={product.images[0]}
          alt={product.name}
          className={styles.image}
          loading="lazy"
        />
        <div className={styles.overlay}>
          <span className={styles.viewBtn}>View Details</span>
        </div>
        <div className={styles.badges}>
          {product.isBestseller && <span className={styles.badge + ' ' + styles.badgeBestseller}>Bestseller</span>}
          {product.isNew && <span className={styles.badge + ' ' + styles.badgeNew}>New</span>}
          {discount && <span className={styles.badge + ' ' + styles.badgeDiscount}>-{discount}%</span>}
        </div>
        {product.customizable && (
          <div className={styles.customTag}>✏️ Customizable</div>
        )}
      </Link>

      <div className={styles.content}>
        <div className={styles.category}>{product.category}</div>
        <h3 className={styles.name}>
          <Link to={`/product/${product.id}`}>{product.name}</Link>
        </h3>
        <StarRating rating={product.rating} />
        <p className={styles.reviewCount}>({product.reviews} reviews)</p>

        <div className={styles.footer}>
          <div className={styles.pricing}>
            <span className={styles.price}>Rs. {product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <span className={styles.originalPrice}>Rs. {product.originalPrice.toLocaleString()}</span>
            )}
          </div>
          <button
            className={styles.addBtn}
            onClick={handleAddToCart}
            aria-label={`Add ${product.name} to cart`}
            disabled={product.stock === 0}
          >
            {product.stock === 0 ? '✕' : '+'}
          </button>
        </div>

        {product.stock <= 5 && product.stock > 0 && (
          <p className={styles.lowStock}>⚠️ Only {product.stock} left!</p>
        )}
      </div>
    </article>
  );
}
