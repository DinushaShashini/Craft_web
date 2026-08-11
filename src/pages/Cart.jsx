import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import styles from './Cart.module.css';

// ─── Empty cart ────────────────────────────────────────────────
function EmptyCart() {
  const navigate = useNavigate();
  return (
    <main className={styles.emptyPage}>
      <div className="container">
        <div className={styles.emptyInner}>
          {/* Animated illustration */}
          <div className={styles.emptyIllustration}>
            <div className={styles.emptyBag}>
              <span className={styles.emptyBagIcon}>🛒</span>
            </div>
            <div className={styles.emptyOrb} />
            <div className={styles.emptyOrb2} />
          </div>

          <h1 className={styles.emptyTitle}>Your Cart is Empty</h1>
          <p className={styles.emptySub}>
            Looks like you haven't added anything yet.<br />
            Explore our handmade collection and find something you love! 💝
          </p>

          <div className={styles.emptyActions}>
            <button className={styles.emptyShopBtn} onClick={() => navigate('/shop')}>
              Browse the Shop
            </button>
            <Link to="/" className={styles.emptyHomeLink}>← Back to Home</Link>
          </div>

          {/* Suggestion chips */}
          <div className={styles.emptySuggestions}>
            <span className={styles.suggestLabel}>Popular right now:</span>
            {[
              { label: '🗝️ Keychains', cat: 'keychains' },
              { label: '✏️ Name Pens', cat: 'accessories' },
              { label: '🎁 Photo Frames', cat: 'gifts' },
            ].map(s => (
              <button
                key={s.cat}
                className={styles.suggestChip}
                onClick={() => navigate(`/shop?category=${s.cat}`)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

// ─── Cart item row ─────────────────────────────────────────────
function CartItemRow({ item, onUpdateQty, onRemove }) {
  const [removing, setRemoving] = useState(false);

  const handleRemove = () => {
    setRemoving(true);
    // small delay for animation
    setTimeout(() => onRemove(item.id, item.customization), 280);
  };

  return (
    <div className={`${styles.row} ${removing ? styles.rowRemoving : ''}`}>
      {/* Image */}
      <div className={styles.rowImage}>
        <Link to={`/product/${item.id}`}>
          <img
            src={item.images?.[0] || '/images/products/ocean-round-resin-keychain.jpg'}
            alt={item.name}
            className={styles.rowImg}
          />
        </Link>
        {item.customizable && (
          <span className={styles.rowCustomBadge}>✏️ Custom</span>
        )}
      </div>

      {/* Product info */}
      <div className={styles.rowInfo}>
        <Link to={`/product/${item.id}`} className={styles.rowName}>{item.name}</Link>
        <span className={styles.rowCat}>{item.category}</span>
        {item.customization && (
          <div className={styles.rowCustomNote}>
            <span className={styles.rowCustomIcon}>✏️</span>
            <span className={styles.rowCustomText}>{item.customization}</span>
          </div>
        )}
      </div>

      {/* Unit price */}
      <div className={styles.rowPrice}>
        <span className={styles.rowPriceLabel}>Unit Price</span>
        <span className={styles.rowPriceVal}>Rs.&nbsp;{item.price.toLocaleString()}</span>
      </div>

      {/* Quantity control */}
      <div className={styles.rowQty}>
        <span className={styles.rowQtyLabel}>Quantity</span>
        <div className={styles.qtyControl}>
          <button
            className={styles.qtyBtn}
            onClick={() => onUpdateQty(item.id, item.quantity - 1, item.customization)}
            disabled={item.quantity <= 1}
            aria-label="Decrease quantity"
          >−</button>
          <span className={styles.qtyVal}>{item.quantity}</span>
          <button
            className={styles.qtyBtn}
            onClick={() => onUpdateQty(item.id, item.quantity + 1, item.customization)}
            disabled={item.quantity >= (item.stock || 99)}
            aria-label="Increase quantity"
          >+</button>
        </div>
        {item.stock > 0 && item.stock <= 5 && (
          <span className={styles.rowStockWarning}>Only {item.stock} left!</span>
        )}
      </div>

      {/* Row subtotal */}
      <div className={styles.rowSubtotal}>
        <span className={styles.rowSubtotalLabel}>Subtotal</span>
        <span className={styles.rowSubtotalVal}>Rs.&nbsp;{(item.price * item.quantity).toLocaleString()}</span>
      </div>

      {/* Remove button */}
      <button
        className={styles.rowRemoveBtn}
        onClick={handleRemove}
        aria-label={`Remove ${item.name} from cart`}
        title="Remove item"
      >
        <span className={styles.rowRemoveIcon}>✕</span>
      </button>
    </div>
  );
}

// ─── Coupon box ────────────────────────────────────────────────
function CouponBox({ appliedCoupon, onApply, onRemove }) {
  const [code, setCode]       = useState('');
  const [status, setStatus]   = useState(null); // null | 'success' | 'error'
  const [message, setMessage] = useState('');
  const inputRef = useRef(null);

  const handleApply = () => {
    if (!code.trim()) {
      setStatus('error');
      setMessage('Please enter a coupon code.');
      return;
    }
    const result = onApply(code);
    if (result.ok) {
      setStatus('success');
      setMessage(`✓ ${result.label}`);
      setCode('');
    } else {
      setStatus('error');
      setMessage(result.error);
    }
  };

  const handleRemove = () => {
    onRemove();
    setStatus(null);
    setMessage('');
    setCode('');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <div className={styles.couponBox}>
      <h3 className={styles.couponTitle}>🏷️ Coupon Code</h3>

      {appliedCoupon ? (
        <div className={styles.couponApplied}>
          <div className={styles.couponAppliedLeft}>
            <span className={styles.couponAppliedIcon}>✓</span>
            <div>
              <strong className={styles.couponCode}>{appliedCoupon.code}</strong>
              <p className={styles.couponDesc}>{appliedCoupon.label}</p>
            </div>
          </div>
          <button className={styles.couponRemoveBtn} onClick={handleRemove} aria-label="Remove coupon">
            ✕
          </button>
        </div>
      ) : (
        <div className={styles.couponInputRow}>
          <input
            ref={inputRef}
            type="text"
            value={code}
            onChange={e => { setCode(e.target.value.toUpperCase()); setStatus(null); }}
            onKeyDown={e => e.key === 'Enter' && handleApply()}
            placeholder="Enter coupon code"
            className={`${styles.couponInput} ${status === 'error' ? styles.couponInputError : ''}`}
            aria-label="Coupon code"
            maxLength={20}
          />
          <button className={styles.couponApplyBtn} onClick={handleApply}>
            Apply
          </button>
        </div>
      )}

      {status && !appliedCoupon && (
        <p className={`${styles.couponMsg} ${status === 'error' ? styles.couponMsgError : styles.couponMsgSuccess}`}>
          {message}
        </p>
      )}

      {/* Hint codes */}
      {!appliedCoupon && (
        <p className={styles.couponHint}>
          Try: <button className={styles.hintCode} onClick={() => setCode('IMOCRAFT10')}>IMOCRAFT10</button> or{' '}
          <button className={styles.hintCode} onClick={() => setCode('WELCOME15')}>WELCOME15</button>
        </p>
      )}
    </div>
  );
}

// ─── Order Summary sidebar ─────────────────────────────────────
function OrderSummary({
  cartCount, cartSubtotal, couponDiscount, shipping,
  cartTotal, appliedCoupon, FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING,
  onCheckout,
}) {
  const remaining = FREE_SHIPPING_THRESHOLD - cartSubtotal;

  return (
    <aside className={styles.summary}>
      <h2 className={styles.summaryTitle}>Order Summary</h2>

      <div className={styles.summaryBody}>
        {/* Subtotal */}
        <div className={styles.summaryRow}>
          <span>Subtotal <span className={styles.summaryCount}>({cartCount} items)</span></span>
          <span>Rs. {cartSubtotal.toLocaleString()}</span>
        </div>

        {/* Delivery */}
        <div className={styles.summaryRow}>
          <span>Delivery Fee</span>
          {shipping === 0
            ? <span className={styles.freeTag}>Free 🎉</span>
            : <span>Rs. {shipping}</span>
          }
        </div>

        {/* Discount */}
        {couponDiscount > 0 && (
          <div className={`${styles.summaryRow} ${styles.discountRow}`}>
            <span>Discount <span className={styles.couponTag}>{appliedCoupon?.code}</span></span>
            <span className={styles.discountAmt}>− Rs. {couponDiscount.toLocaleString()}</span>
          </div>
        )}

        {/* Free shipping progress bar */}
        {shipping > 0 && remaining > 0 && (
          <div className={styles.freeShipBar}>
            <div className={styles.freeShipText}>
              Add <strong>Rs. {remaining.toLocaleString()}</strong> more for free shipping!
            </div>
            <div className={styles.freeShipTrack}>
              <div
                className={styles.freeShipFill}
                style={{ width: `${Math.min(100, (cartSubtotal / FREE_SHIPPING_THRESHOLD) * 100)}%` }}
              />
            </div>
          </div>
        )}
        {shipping > 0 && remaining <= 0 && (
          <p className={styles.freeShipReached}>🎉 You qualify for free shipping!</p>
        )}

        <div className={styles.summaryDivider} />

        {/* Total */}
        <div className={`${styles.summaryRow} ${styles.totalRow}`}>
          <span>Total</span>
          <div>
            <span className={styles.totalAmount}>Rs. {cartTotal.toLocaleString()}</span>
            {couponDiscount > 0 && (
              <span className={styles.totalSaving}>You save Rs. {couponDiscount.toLocaleString()}</span>
            )}
          </div>
        </div>
      </div>

      {/* Checkout button */}
      <button className={styles.checkoutBtn} onClick={onCheckout}>
        Proceed to Checkout →
      </button>

      {/* WhatsApp */}
      <a
        href="https://wa.me/94XXXXXXXXX?text=Hi!%20I'd%20like%20to%20place%20an%20order."
        target="_blank"
        rel="noopener noreferrer"
        className={styles.whatsappBtn}
      >
        💬 Order via WhatsApp
      </a>

      {/* Payment methods */}
      <div className={styles.payMethods}>
        {['🏦 Bank Transfer', '💳 Online Pay', '📱 Mobile Pay', '💵 Cash on Delivery'].map(m => (
          <span key={m} className={styles.payMethod}>{m}</span>
        ))}
      </div>

      {/* Trust row */}
      <div className={styles.trustRow}>
        {['🔒 Secure', '🚚 Fast Delivery', '💝 Gift Wrapped'].map(t => (
          <span key={t} className={styles.trustItem}>{t}</span>
        ))}
      </div>
    </aside>
  );
}

// ─── Main Cart page ────────────────────────────────────────────
export default function Cart() {
  const {
    cartItems, cartCount, cartSubtotal,
    couponDiscount, shipping, cartTotal,
    appliedCoupon, FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING,
    removeFromCart, updateQuantity, clearCart,
    applyCoupon, removeCoupon,
  } = useCart();
  const navigate = useNavigate();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Empty state
  if (cartItems.length === 0) return <EmptyCart />;

  return (
    <main className={styles.cartPage}>
      <div className="container">

        {/* ── Page header ── */}
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Shopping Cart</h1>
            <p className={styles.pageSubtitle}>{cartCount} {cartCount === 1 ? 'item' : 'items'} in your cart</p>
          </div>
          <Link to="/shop" className={styles.continueShoppingLink}>
            ← Continue Shopping
          </Link>
        </div>

        <div className={styles.layout}>

          {/* ── Left: Items + Coupon ── */}
          <div className={styles.leftCol}>

            {/* Table header (desktop) */}
            <div className={styles.tableHead}>
              <span>Product</span>
              <span></span>
              <span>Price</span>
              <span>Quantity</span>
              <span>Subtotal</span>
              <span></span>
            </div>

            {/* Item rows */}
            <div className={styles.itemsList}>
              {cartItems.map(item => (
                <CartItemRow
                  key={`${item.id}-${item.customization}`}
                  item={item}
                  onUpdateQty={updateQuantity}
                  onRemove={removeFromCart}
                />
              ))}
            </div>

            {/* Bottom bar */}
            <div className={styles.listFooter}>
              <Link to="/shop" className={styles.continueBtn}>
                ← Continue Shopping
              </Link>

              {/* Clear cart */}
              {!showClearConfirm ? (
                <button
                  className={styles.clearBtn}
                  onClick={() => setShowClearConfirm(true)}
                >
                  🗑️ Clear Cart
                </button>
              ) : (
                <div className={styles.clearConfirm}>
                  <span>Remove all items?</span>
                  <button
                    className={styles.clearConfirmYes}
                    onClick={() => { clearCart(); setShowClearConfirm(false); }}
                  >
                    Yes, clear
                  </button>
                  <button
                    className={styles.clearConfirmNo}
                    onClick={() => setShowClearConfirm(false)}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Coupon code box */}
            <CouponBox
              appliedCoupon={appliedCoupon}
              onApply={applyCoupon}
              onRemove={removeCoupon}
            />
          </div>

          {/* ── Right: Order Summary ── */}
          <OrderSummary
            cartCount={cartCount}
            cartSubtotal={cartSubtotal}
            couponDiscount={couponDiscount}
            shipping={shipping}
            cartTotal={cartTotal}
            appliedCoupon={appliedCoupon}
            FREE_SHIPPING_THRESHOLD={FREE_SHIPPING_THRESHOLD}
            STANDARD_SHIPPING={STANDARD_SHIPPING}
            onCheckout={() => navigate('/checkout')}
          />
        </div>
      </div>
    </main>
  );
}
