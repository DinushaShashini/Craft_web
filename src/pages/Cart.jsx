import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import styles from './Cart.module.css';

export default function Cart() {
  const { cartItems, cartTotal, cartCount, removeFromCart, updateQuantity, clearCart } = useCart();
  const navigate = useNavigate();

  const shipping = cartTotal > 2000 ? 0 : 200;
  const total = cartTotal + shipping;

  if (cartItems.length === 0) {
    return (
      <main className={styles.emptyPage}>
        <div className="container">
          <div className="section-header">
            <h1 className="section-title">Your Cart</h1>
          </div>
          <EmptyState
            icon="🛒"
            title="Your cart is empty"
            subtitle="Looks like you haven't added anything yet. Explore our handmade collection!"
            actionLabel="Browse Shop"
            onAction={() => navigate('/shop')}
          />
        </div>
      </main>
    );
  }

  return (
    <main className={styles.cartPage}>
      <div className="container">
        <div className={styles.header}>
          <h1 className={styles.title}>Shopping Cart</h1>
          <span className={styles.itemCount}>{cartCount} {cartCount === 1 ? 'item' : 'items'}</span>
        </div>

        <div className={styles.layout}>
          {/* Cart Items */}
          <div className={styles.itemsList}>
            {/* Column headers */}
            <div className={styles.tableHeader}>
              <span>Product</span>
              <span>Price</span>
              <span>Quantity</span>
              <span>Total</span>
              <span></span>
            </div>

            {cartItems.map((item) => (
              <div key={`${item.id}-${item.customization}`} className={styles.cartItem}>
                <div className={styles.itemProduct}>
                  <Link to={`/product/${item.id}`}>
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className={styles.itemImage}
                    />
                  </Link>
                  <div className={styles.itemDetails}>
                    <Link to={`/product/${item.id}`} className={styles.itemName}>{item.name}</Link>
                    <span className={styles.itemCategory}>{item.category}</span>
                    {item.customization && (
                      <span className={styles.itemCustom}>✏️ {item.customization}</span>
                    )}
                  </div>
                </div>
                <div className={styles.itemPrice}>Rs. {item.price.toLocaleString()}</div>
                <div className={styles.quantityControl}>
                  <button
                    className={styles.qtyBtn}
                    onClick={() => updateQuantity(item.id, item.quantity - 1, item.customization)}
                    aria-label="Decrease quantity"
                  >−</button>
                  <span className={styles.qtyValue}>{item.quantity}</span>
                  <button
                    className={styles.qtyBtn}
                    onClick={() => updateQuantity(item.id, item.quantity + 1, item.customization)}
                    aria-label="Increase quantity"
                  >+</button>
                </div>
                <div className={styles.itemTotal}>Rs. {(item.price * item.quantity).toLocaleString()}</div>
                <button
                  className={styles.removeBtn}
                  onClick={() => removeFromCart(item.id, item.customization)}
                  aria-label={`Remove ${item.name}`}
                >✕</button>
              </div>
            ))}

            {/* Cart Actions */}
            <div className={styles.cartActions}>
              <Button variant="ghost" size="sm" onClick={() => navigate('/shop')}>
                ← Continue Shopping
              </Button>
              <button className={styles.clearBtn} onClick={clearCart}>
                🗑️ Clear Cart
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <aside className={styles.summary}>
            <h2 className={styles.summaryTitle}>Order Summary</h2>

            <div className={styles.summaryRows}>
              <div className={styles.summaryRow}>
                <span>Subtotal ({cartCount} items)</span>
                <span>Rs. {cartTotal.toLocaleString()}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Shipping</span>
                <span className={shipping === 0 ? styles.freeShipping : ''}>
                  {shipping === 0 ? '🎉 Free!' : `Rs. ${shipping}`}
                </span>
              </div>
              {shipping > 0 && (
                <p className={styles.freeShippingNote}>
                  Add Rs. {(2000 - cartTotal).toLocaleString()} more for free shipping!
                </p>
              )}
              <div className={styles.divider} />
              <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                <span>Total</span>
                <span>Rs. {total.toLocaleString()}</span>
              </div>
            </div>

            <Button variant="primary" size="lg" fullWidth onClick={() => navigate('/checkout')}>
              Proceed to Checkout →
            </Button>

            <a
              href="https://wa.me/94XXXXXXXXX?text=Hi!%20I'd%20like%20to%20place%20an%20order."
              target="_blank"
              rel="noopener noreferrer"
              className={styles.whatsappOrder}
            >
              💬 Order via WhatsApp
            </a>

            <div className={styles.paymentIcons}>
              <span className={styles.payIcon}>🏦 Bank Transfer</span>
              <span className={styles.payIcon}>💳 Online Pay</span>
              <span className={styles.payIcon}>📱 Mobile Pay</span>
            </div>

            <div className={styles.guarantees}>
              {['🔒 Secure Checkout', '🚚 Fast Delivery', '💝 Quality Guaranteed'].map(g => (
                <span key={g} className={styles.guarantee}>{g}</span>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
