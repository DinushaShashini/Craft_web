import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import styles from './OrderTracking.module.css';

// ─── 6-step tracking stages ────────────────────────────────────
const STAGES = [
  {
    key: 'placed',
    icon: '📋',
    label: 'Order Placed',
    desc: 'We have received your order and it\'s been confirmed.',
    color: '#7C5CBF',
  },
  {
    key: 'payment',
    icon: '💳',
    label: 'Payment Confirmed',
    desc: 'Your payment has been verified. Thank you!',
    color: '#2980B9',
  },
  {
    key: 'preparing',
    icon: '✂️',
    label: 'Preparing',
    desc: 'Our artisans are handcrafting your items with love and care.',
    color: '#C9785A',
  },
  {
    key: 'dispatched',
    icon: '📦',
    label: 'Dispatched',
    desc: 'Your order has been packed and handed to our courier partner.',
    color: '#D4A853',
  },
  {
    key: 'out',
    icon: '🚚',
    label: 'Out for Delivery',
    desc: 'Your package is out for delivery and will arrive today!',
    color: '#27AE60',
  },
  {
    key: 'delivered',
    icon: '🎉',
    label: 'Delivered',
    desc: 'Your order has been delivered. Enjoy your IMO Craft pieces!',
    color: '#E67E22',
  },
];

// ─── Mock order generator ──────────────────────────────────────
// In a real app this would fetch from your backend.
function getMockOrder(orderNum, phone) {
  if (!orderNum) return null;

  // Deterministic status from order number hash
  const hash = orderNum.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const stageIdx = Math.min(hash % 6, 5);

  const placed  = new Date(Date.now() - (5 - stageIdx) * 24 * 60 * 60 * 1000);
  const estDays = stageIdx >= 4 ? 0 : (5 - stageIdx);
  const estDate = new Date(Date.now() + estDays * 24 * 60 * 60 * 1000);

  return {
    orderNumber: orderNum,
    phone: phone || '07X XXX XXXX',
    stageIdx,
    stage: STAGES[stageIdx],
    placedDate: placed.toLocaleDateString('en-LK', { day: 'numeric', month: 'long', year: 'numeric' }),
    estimatedDate: stageIdx >= 5
      ? placed.toLocaleDateString('en-LK', { day: 'numeric', month: 'long', year: 'numeric' })
      : estDate.toLocaleDateString('en-LK', { day: 'numeric', month: 'long', year: 'numeric' }),
    courier: 'Lanka Logistics Express',
    trackingRef: 'LLE-' + orderNum.replace(/-/g, '').slice(-6),
    deliveryType: hash % 2 === 0 ? 'Standard Delivery' : 'Express Delivery',
    address: 'Colombo, Western Province',
    items: [
      { name: 'Ocean Round Resin Keychain', qty: 1, price: 850 },
      { name: 'Glitter Letter Keychain',   qty: 2, price: 750 },
    ],
    subtotal: 2350,
    deliveryFee: 200,
    total: 2550,
  };
}

// ─── Search form ───────────────────────────────────────────────
function SearchForm({ onSearch, loading }) {
  const [orderNum, setOrderNum] = useState('');
  const [phone, setPhone]       = useState('');
  const [err, setErr]           = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!orderNum.trim()) { setErr('Please enter your order number.'); return; }
    setErr('');
    onSearch(orderNum.trim().toUpperCase(), phone.trim());
  };

  return (
    <form className={styles.searchCard} onSubmit={handleSubmit} noValidate>
      <div className={styles.searchIcon}>📦</div>
      <h2 className={styles.searchTitle}>Track Your Order</h2>
      <p className={styles.searchSub}>
        Enter your order number to see the real-time status of your handmade order.
      </p>

      <div className={styles.searchFields}>
        <div className={styles.searchField}>
          <label className={styles.searchLabel} htmlFor="track-order">
            Order Number <span className={styles.req}>*</span>
          </label>
          <input
            id="track-order"
            type="text"
            value={orderNum}
            onChange={e => { setOrderNum(e.target.value.toUpperCase()); setErr(''); }}
            placeholder="e.g. IMO-2026-92597"
            className={`${styles.searchInput} ${err ? styles.searchInputErr : ''}`}
            autoComplete="off"
            spellCheck={false}
          />
          {err && <span className={styles.searchErr}>⚠ {err}</span>}
        </div>

        <div className={styles.searchField}>
          <label className={styles.searchLabel} htmlFor="track-phone">
            Phone Number <span className={styles.optional}>(optional)</span>
          </label>
          <input
            id="track-phone"
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="e.g. 0771234567"
            className={styles.searchInput}
            autoComplete="tel"
          />
        </div>
      </div>

      <button type="submit" className={styles.searchBtn} disabled={loading}>
        {loading
          ? <><span className={styles.spinner} /> Searching…</>
          : '🔍 Track Order'
        }
      </button>

      <p className={styles.searchHint}>
        Your order number was emailed to you after checkout. Check your inbox or{' '}
        <a href="https://wa.me/94XXXXXXXXX" target="_blank" rel="noopener noreferrer">
          contact us on WhatsApp
        </a>.
      </p>
    </form>
  );
}

// ─── Stage progress bar (horizontal on desktop) ────────────────
function ProgressBar({ stageIdx }) {
  const pct = (stageIdx / (STAGES.length - 1)) * 100;
  return (
    <div className={styles.progressWrap}>
      <div className={styles.progressTrack}>
        <div className={styles.progressFill} style={{ width: `${pct}%` }} />
        {STAGES.map((s, i) => {
          const done    = i < stageIdx;
          const current = i === stageIdx;
          return (
            <div
              key={s.key}
              className={styles.progressNode}
              style={{ left: `${(i / (STAGES.length - 1)) * 100}%` }}
              title={s.label}
            >
              <div
                className={`${styles.progressDot} ${done ? styles.dotDone : current ? styles.dotCurrent : styles.dotPending}`}
                style={current ? { '--dot-color': s.color } : done ? { '--dot-color': '#27AE60' } : {}}
              >
                {done ? '✓' : s.icon}
              </div>
              <span className={`${styles.progressLabel} ${current ? styles.progressLabelActive : ''}`}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Detailed vertical timeline ────────────────────────────────
function Timeline({ stageIdx }) {
  return (
    <div className={styles.timeline}>
      {STAGES.map((s, i) => {
        const done    = i < stageIdx;
        const current = i === stageIdx;
        const pending = i > stageIdx;
        return (
          <div key={s.key} className={`${styles.step} ${current ? styles.stepCurrent : ''} ${pending ? styles.stepPending : ''}`}>
            {/* Left: dot + line */}
            <div className={styles.stepLeft}>
              <div
                className={`${styles.stepDot} ${done ? styles.stepDotDone : current ? styles.stepDotCurrent : styles.stepDotPending}`}
                style={current ? { background: s.color, borderColor: s.color, boxShadow: `0 0 0 5px ${s.color}22` } : {}}
              >
                {done ? '✓' : s.icon}
              </div>
              {i < STAGES.length - 1 && (
                <div className={`${styles.stepLine} ${done ? styles.stepLineDone : current ? styles.stepLineCurrent : ''}`} />
              )}
            </div>

            {/* Right: content */}
            <div className={styles.stepBody}>
              <div className={styles.stepHead}>
                <h3 className={`${styles.stepLabel} ${current ? styles.stepLabelCurrent : pending ? styles.stepLabelPending : ''}`}>
                  {s.label}
                </h3>
                {current && (
                  <span className={styles.stepNowBadge} style={{ background: s.color }}>
                    ● Live
                  </span>
                )}
                {done && <span className={styles.stepDoneBadge}>✓ Done</span>}
              </div>
              <p className={`${styles.stepDesc} ${pending ? styles.stepDescPending : ''}`}>
                {pending ? 'Pending…' : s.desc}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Not found state ───────────────────────────────────────────
function NotFound({ query }) {
  return (
    <div className={styles.notFound}>
      <div className={styles.notFoundIcon}>🔍</div>
      <h3 className={styles.notFoundTitle}>Order Not Found</h3>
      <p className={styles.notFoundDesc}>
        We couldn't find an order matching <strong>"{query}"</strong>.<br />
        Please double-check your order number or{' '}
        <a href="https://wa.me/94XXXXXXXXX" target="_blank" rel="noopener noreferrer">
          contact us on WhatsApp
        </a>.
      </p>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────
export default function OrderTracking() {
  const [searchParams] = useSearchParams();
  const initOrder = searchParams.get('order') || '';

  const [query,   setQuery]   = useState(initOrder);
  const [phone,   setPhone]   = useState('');
  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched,setSearched]= useState(false);
  const resultRef = useRef(null);

  // Auto-search if order param is in URL (e.g. coming from confirmation page)
  useEffect(() => {
    if (initOrder) {
      handleSearch(initOrder, '');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSearch(orderNum, ph) {
    setLoading(true);
    setQuery(orderNum);
    setPhone(ph);
    // Simulate network latency
    setTimeout(() => {
      const result = getMockOrder(orderNum, ph);
      setOrder(result);
      setSearched(true);
      setLoading(false);
      // Scroll to result
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }, 800);
  }

  const currentStage = order ? STAGES[order.stageIdx] : null;

  return (
    <main className={styles.page}>

      {/* ── Hero header ── */}
      <div className={styles.hero}>
        <div className="container">
          <span className={styles.heroTag}>📦 Order Tracking</span>
          <h1 className={styles.heroTitle}>Where's My Order?</h1>
          <p className={styles.heroSub}>
            Track your handmade parcel from our workshop to your doorstep.
          </p>
        </div>
      </div>

      <div className="container">

        {/* ── Search form ── */}
        <SearchForm onSearch={handleSearch} loading={loading} />

        {/* ── Not found ── */}
        {searched && !order && !loading && <NotFound query={query} />}

        {/* ── Order result ── */}
        {order && !loading && (
          <div className={styles.result} ref={resultRef}>

            {/* ─ Card header ─ */}
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderLeft}>
                <div>
                  <span className={styles.headerOrderLabel}>Order</span>
                  <h2 className={styles.headerOrderNum}>{order.orderNumber}</h2>
                  <span className={styles.headerDate}>Placed on {order.placedDate}</span>
                </div>
              </div>
              <div
                className={styles.statusPill}
                style={{ background: currentStage.color }}
              >
                <span className={styles.statusPillIcon}>{currentStage.icon}</span>
                <span className={styles.statusPillLabel}>{currentStage.label}</span>
              </div>
            </div>

            {/* ─ Horizontal progress bar ─ */}
            <div className={styles.progressSection}>
              <ProgressBar stageIdx={order.stageIdx} />
            </div>

            {/* ─ Main body: timeline + info ─ */}
            <div className={styles.cardBody}>

              {/* Left: detailed timeline */}
              <div className={styles.timelineCol}>
                <h3 className={styles.colTitle}>Order Progress</h3>
                <Timeline stageIdx={order.stageIdx} />
              </div>

              {/* Right: delivery info + order items */}
              <div className={styles.infoCol}>

                {/* Estimated delivery card */}
                <div className={styles.infoCard}>
                  <div className={styles.infoCardHead}>
                    <span>🚚</span>
                    <h4 className={styles.infoCardTitle}>Delivery Information</h4>
                  </div>
                  <div className={styles.infoRows}>
                    <div className={styles.infoRow}>
                      <span className={styles.infoRowLabel}>Status</span>
                      <span
                        className={styles.infoRowVal}
                        style={{ color: currentStage.color, fontWeight: 700 }}
                      >
                        {currentStage.icon} {currentStage.label}
                      </span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.infoRowLabel}>
                        {order.stageIdx >= 5 ? 'Delivered On' : 'Est. Delivery'}
                      </span>
                      <span className={`${styles.infoRowVal} ${styles.infoDateVal}`}>
                        {order.estimatedDate}
                      </span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.infoRowLabel}>Delivery Type</span>
                      <span className={styles.infoRowVal}>{order.deliveryType}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.infoRowLabel}>Courier</span>
                      <span className={styles.infoRowVal}>{order.courier}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.infoRowLabel}>Tracking Ref.</span>
                      <span className={`${styles.infoRowVal} ${styles.infoMono}`}>{order.trackingRef}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.infoRowLabel}>Deliver To</span>
                      <span className={styles.infoRowVal}>{order.address}</span>
                    </div>
                  </div>
                </div>

                {/* Order items card */}
                <div className={styles.infoCard}>
                  <div className={styles.infoCardHead}>
                    <span>🛍️</span>
                    <h4 className={styles.infoCardTitle}>Items in This Order</h4>
                  </div>
                  <div className={styles.itemsList}>
                    {order.items.map((item, i) => (
                      <div key={i} className={styles.orderItem}>
                        <div className={styles.orderItemLeft}>
                          <span className={styles.orderItemQty}>×{item.qty}</span>
                          <span className={styles.orderItemName}>{item.name}</span>
                        </div>
                        <span className={styles.orderItemPrice}>
                          Rs. {(item.price * item.qty).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className={styles.itemsTotals}>
                    <div className={styles.itemsTotalRow}>
                      <span>Subtotal</span>
                      <span>Rs. {order.subtotal.toLocaleString()}</span>
                    </div>
                    <div className={styles.itemsTotalRow}>
                      <span>Delivery</span>
                      <span>{order.deliveryFee === 0 ? 'Free' : `Rs. ${order.deliveryFee}`}</span>
                    </div>
                    <div className={`${styles.itemsTotalRow} ${styles.itemsGrandTotal}`}>
                      <span>Total</span>
                      <span>Rs. {order.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className={styles.actions}>
                  <Link to="/shop" className={styles.shopBtn}>
                    🛍️ Continue Shopping
                  </Link>
                  <a
                    href={`https://wa.me/94XXXXXXXXX?text=Hi!%20I%20need%20help%20with%20order%20${order.orderNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.waBtn}
                  >
                    💬 Get Help
                  </a>
                </div>
              </div>
            </div>

            {/* ─ Footer ─ */}
            <div className={styles.cardFooter}>
              <p>📦 All IMO Craft orders are gift-wrapped and shipped with care.</p>
              <a
                href={`https://wa.me/94XXXXXXXXX?text=Hi!%20Order%20${order.orderNumber}%20update%20please.`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.footerWa}
              >
                💬 Contact Support via WhatsApp
              </a>
            </div>
          </div>
        )}

        {/* ── FAQ strip ── */}
        {!order && (
          <div className={styles.faqStrip}>
            {[
              { q: 'Where is my order number?', a: 'Your order number was emailed to you right after checkout. It looks like IMO-2026-XXXXX.' },
              { q: 'How long does delivery take?', a: 'Standard delivery takes 3–5 business days. Custom/made-to-order items need 3–7 days of crafting before dispatch.' },
              { q: 'Can I change my address?', a: 'Contact us on WhatsApp as soon as possible if your order has not yet been dispatched.' },
            ].map(f => (
              <div key={f.q} className={styles.faqItem}>
                <h4 className={styles.faqQ}>{f.q}</h4>
                <p className={styles.faqA}>{f.a}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
