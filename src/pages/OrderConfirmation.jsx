import { useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styles from './OrderConfirmation.module.css';

// ─── Confetti burst (pure CSS animation via JS) ────────────────
function Confetti() {
  const COLORS = ['#C9785A', '#D4A853', '#8BAF8B', '#9B8EC4', '#E8A5A0', '#7EC8B0'];
  const PIECES = Array.from({ length: 48 }, (_, i) => ({
    id: i,
    color: COLORS[i % COLORS.length],
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 1.5}s`,
    size: `${6 + Math.random() * 8}px`,
    drift: `${(Math.random() - 0.5) * 200}px`,
    rotate: `${Math.random() * 720}deg`,
    duration: `${1.8 + Math.random() * 1.2}s`,
  }));

  return (
    <div className={styles.confettiWrap} aria-hidden="true">
      {PIECES.map(p => (
        <span
          key={p.id}
          className={styles.confettiPiece}
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            background: p.color,
            animationDelay: p.delay,
            animationDuration: p.duration,
            '--drift': p.drift,
            '--rotate': p.rotate,
          }}
        />
      ))}
    </div>
  );
}

// ─── Status timeline steps ─────────────────────────────────────
const TIMELINE = [
  { icon: '✅', label: 'Order Placed',   desc: 'We have received your order.' },
  { icon: '✂️', label: 'Being Crafted',  desc: 'Our artisans are handcrafting your items.' },
  { icon: '📦', label: 'Ready to Ship',  desc: 'Packed and ready for dispatch.' },
  { icon: '🚚', label: 'Shipped',         desc: 'On its way to you!' },
  { icon: '🎉', label: 'Delivered',       desc: 'Enjoy your IMO Craft pieces!' },
];

// ─── Payment method labels ─────────────────────────────────────
const PAYMENT_LABELS = {
  bank: { icon: '🏦', label: 'Bank Transfer',     note: 'Please send your payment slip via WhatsApp to confirm your order.' },
  cod:  { icon: '💵', label: 'Cash on Delivery',  note: 'Pay in cash when your parcel arrives.' },
  card: { icon: '💳', label: 'Card Payment',       note: 'Payment will be processed securely.' },
};

// ─── Delivery durations ────────────────────────────────────────
const DELIVERY_DURATION = {
  standard: { label: 'Standard Delivery', days: 5 },
  express:  { label: 'Express Delivery',  days: 2 },
};

// ─── Helpers ───────────────────────────────────────────────────
function addDays(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString('en-LK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

// ═══════════════════════════════════════════════════════════════
export default function OrderConfirmation() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const printRef  = useRef(null);
  const order     = location.state?.order;

  // Redirect if landed here without order data
  useEffect(() => {
    if (!order) navigate('/shop', { replace: true });
  }, [order, navigate]);

  if (!order) return null;

  const {
    orderNumber, customerName, items,
    subtotal, couponDiscount, deliveryFee, total,
    paymentMethod, address, city, district, province,
    postalCode, phone, email, deliveryType, notes,
  } = order;

  const payInfo         = PAYMENT_LABELS[paymentMethod] || PAYMENT_LABELS.bank;
  const deliveryInfo    = DELIVERY_DURATION[deliveryType] || DELIVERY_DURATION.standard;
  const estimatedDate   = addDays(deliveryInfo.days + (deliveryType === 'standard' ? 2 : 0));
  const orderDate       = new Date().toLocaleDateString('en-LK', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <main className={styles.page}>
      {/* Confetti burst */}
      <Confetti />

      <div className="container">
        {/* ── Hero thank-you section ── */}
        <div className={styles.hero}>
          <div className={styles.heroCheck}>
            <span className={styles.heroCheckIcon}>✓</span>
          </div>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>Thank you for your order! ❤️</h1>
            <p className={styles.heroSub}>
              Your handmade piece is in good hands. We'll start crafting it with love right away!
            </p>
          </div>
          <div className={styles.orderNumBox}>
            <span className={styles.orderNumLabel}>Order Number</span>
            <span className={styles.orderNumVal}>{orderNumber}</span>
            <span className={styles.orderNumNote}>Keep this number to track your order</span>
          </div>
        </div>

        <div className={styles.grid} ref={printRef}>

          {/* ── LEFT column ── */}
          <div className={styles.leftCol}>

            {/* Customer info card */}
            <div className={styles.card}>
              <div className={styles.cardHead}>
                <span className={styles.cardIcon}>👤</span>
                <h2 className={styles.cardTitle}>Customer Information</h2>
              </div>
              <div className={styles.infoGrid}>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Name</span>
                  <span className={styles.infoVal}>{customerName}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Phone</span>
                  <span className={styles.infoVal}>{phone}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Email</span>
                  <span className={styles.infoVal}>{email}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Order Date</span>
                  <span className={styles.infoVal}>{orderDate}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Payment</span>
                  <span className={styles.infoVal}>{payInfo.icon} {payInfo.label}</span>
                </div>
              </div>
            </div>

            {/* Delivery address */}
            <div className={styles.card}>
              <div className={styles.cardHead}>
                <span className={styles.cardIcon}>📍</span>
                <h2 className={styles.cardTitle}>Delivery Address</h2>
              </div>
              <address className={styles.addressBlock}>
                <strong>{customerName}</strong><br />
                {address}<br />
                {city}{district ? `, ${district}` : ''}<br />
                {province}<br />
                {postalCode && <>Postal: {postalCode}<br /></>}
                📞 {phone}
              </address>
              {notes && (
                <div className={styles.noteBox}>
                  <span>📝</span>
                  <p>{notes}</p>
                </div>
              )}
            </div>

            {/* Delivery timeline */}
            <div className={styles.card}>
              <div className={styles.cardHead}>
                <span className={styles.cardIcon}>🚚</span>
                <h2 className={styles.cardTitle}>Estimated Delivery</h2>
              </div>

              <div className={styles.deliveryMeta}>
                <div className={styles.deliveryMetaItem}>
                  <span className={styles.deliveryMetaLabel}>Delivery Type</span>
                  <span className={styles.deliveryMetaVal}>{deliveryInfo.label}</span>
                </div>
                <div className={styles.deliveryMetaItem}>
                  <span className={styles.deliveryMetaLabel}>Estimated Arrival</span>
                  <span className={`${styles.deliveryMetaVal} ${styles.deliveryMetaDate}`}>{estimatedDate}</span>
                </div>
              </div>

              {/* Mini timeline */}
              <div className={styles.timeline}>
                {TIMELINE.map((step, i) => {
                  const active = i === 0; // just placed
                  return (
                    <div key={step.label} className={styles.timelineStep}>
                      <div className={styles.timelineLeft}>
                        <div className={`${styles.timelineDot} ${active ? styles.dotActive : styles.dotPending}`}>
                          {active ? step.icon : i + 1}
                        </div>
                        {i < TIMELINE.length - 1 && (
                          <div className={`${styles.timelineLine} ${active ? styles.linePartial : ''}`} />
                        )}
                      </div>
                      <div className={styles.timelineBody}>
                        <span className={`${styles.timelineLabel} ${active ? styles.timelineLabelActive : ''}`}>
                          {step.label}
                          {active && <span className={styles.timelineBadge}>Now</span>}
                        </span>
                        <p className={styles.timelineDesc}>{active ? step.desc : '…'}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── RIGHT column ── */}
          <div className={styles.rightCol}>

            {/* Order summary card */}
            <div className={`${styles.card} ${styles.summaryCard}`}>
              <div className={styles.cardHead}>
                <span className={styles.cardIcon}>🛍️</span>
                <h2 className={styles.cardTitle}>Order Summary</h2>
                <span className={styles.cardBadge}>{items.length} item{items.length !== 1 ? 's' : ''}</span>
              </div>

              {/* Items */}
              <div className={styles.items}>
                {items.map((item, idx) => (
                  <div key={idx} className={styles.item}>
                    <div className={styles.itemImgBox}>
                      <img
                        src={item.images?.[0] || '/images/products/placeholder.jpg'}
                        alt={item.name}
                        className={styles.itemImg}
                      />
                      <span className={styles.itemQtyBadge}>{item.quantity}</span>
                    </div>
                    <div className={styles.itemInfo}>
                      <span className={styles.itemName}>{item.name}</span>
                      <span className={styles.itemCat}>{item.category}</span>
                      {item.customization && (
                        <span className={styles.itemCustom}>✏️ {item.customization}</span>
                      )}
                    </div>
                    <div className={styles.itemPrices}>
                      <span className={styles.itemTotal}>Rs.&nbsp;{(item.price * item.quantity).toLocaleString()}</span>
                      {item.quantity > 1 && (
                        <span className={styles.itemUnit}>Rs.&nbsp;{item.price.toLocaleString()} each</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className={styles.totals}>
                <div className={styles.totalRow}>
                  <span>Subtotal</span>
                  <span>Rs. {subtotal.toLocaleString()}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className={`${styles.totalRow} ${styles.discountRow}`}>
                    <span>Discount Applied</span>
                    <span>− Rs. {couponDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div className={styles.totalRow}>
                  <span>Delivery Fee</span>
                  <span className={deliveryFee === 0 ? styles.freeTag : ''}>
                    {deliveryFee === 0 ? 'Free 🎉' : `Rs. ${deliveryFee}`}
                  </span>
                </div>
                <div className={styles.totalDivider} />
                <div className={`${styles.totalRow} ${styles.grandTotal}`}>
                  <span>Total Paid</span>
                  <span className={styles.grandTotalAmt}>Rs. {total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Payment instruction */}
            {payInfo.note && (
              <div className={`${styles.card} ${styles.payNoteCard}`}>
                <div className={styles.cardHead}>
                  <span className={styles.cardIcon}>{payInfo.icon}</span>
                  <h2 className={styles.cardTitle}>Payment Instructions</h2>
                </div>
                <p className={styles.payNoteText}>{payInfo.note}</p>
                {paymentMethod === 'bank' && (
                  <table className={styles.bankTable}>
                    <tbody>
                      <tr><td>Bank</td><td><strong>Bank of Ceylon</strong></td></tr>
                      <tr><td>Account</td><td><strong>IMO Craft</strong></td></tr>
                      <tr><td>Acc. No.</td><td><strong>XXXX-XXXX-XXXX</strong></td></tr>
                      <tr><td>Reference</td><td><strong>{orderNumber}</strong></td></tr>
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className={styles.actions}>
              <Link to={`/order-tracking?order=${orderNumber}`} className={styles.trackBtn}>
                📦 Track My Order
              </Link>
              <Link to="/shop" className={styles.shopBtn}>
                🛍️ Continue Shopping
              </Link>
            </div>

            {/* WhatsApp help */}
            <a
              href={`https://wa.me/94XXXXXXXXX?text=Hi!%20My%20order%20number%20is%20${orderNumber}.%20I%20need%20assistance.`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.whatsappBtn}
            >
              💬 Need help? Chat with us on WhatsApp
            </a>

            {/* Print receipt */}
            <button
              className={styles.printBtn}
              onClick={() => window.print()}
            >
              🖨️ Print Receipt
            </button>
          </div>
        </div>

        {/* Bottom banner */}
        <div className={styles.bottomBanner}>
          <span className={styles.bannerIcon}>🎁</span>
          <div className={styles.bannerText}>
            <strong>Your order is gift-wrapped at no extra cost!</strong>
            <p>Every IMO Craft order ships in our signature box with a handwritten thank-you note.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
