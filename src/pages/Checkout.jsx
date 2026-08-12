import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import styles from './Checkout.module.css';

// ─── Sri Lanka data ────────────────────────────────────────────
const PROVINCES = [
  'Western Province', 'Central Province', 'Southern Province',
  'Northern Province', 'Eastern Province', 'North Western Province',
  'North Central Province', 'Uva Province', 'Sabaragamuwa Province',
];

const DISTRICTS = {
  'Western Province':      ['Colombo', 'Gampaha', 'Kalutara'],
  'Central Province':      ['Kandy', 'Matale', 'Nuwara Eliya'],
  'Southern Province':     ['Galle', 'Matara', 'Hambantota'],
  'Northern Province':     ['Jaffna', 'Kilinochchi', 'Mannar', 'Mullaitivu', 'Vavuniya'],
  'Eastern Province':      ['Ampara', 'Batticaloa', 'Trincomalee'],
  'North Western Province':['Kurunegala', 'Puttalam'],
  'North Central Province':['Anuradhapura', 'Polonnaruwa'],
  'Uva Province':          ['Badulla', 'Monaragala'],
  'Sabaragamuwa Province': ['Kegalle', 'Ratnapura'],
};

const DELIVERY_OPTIONS = [
  {
    id: 'standard',
    label: 'Standard Delivery',
    icon: '📦',
    duration: '3–5 business days',
    fee: 200,
    freeover: 2000,
    desc: 'Reliable islandwide delivery via registered courier.',
  },
  {
    id: 'express',
    label: 'Express Delivery',
    icon: '⚡',
    duration: '1–2 business days',
    fee: 450,
    freeover: null,
    desc: 'Priority dispatch. Available for Colombo & suburbs.',
  },
];

const PAYMENT_METHODS = [
  {
    id: 'card',
    label: 'Card Payment',
    icon: '💳',
    desc: 'Visa / Mastercard / Amex — secure online payment',
    badge: 'Coming Soon',
    disabled: true,
  },
  {
    id: 'bank',
    label: 'Bank Transfer',
    icon: '🏦',
    desc: "Pay directly to our bank account. We'll confirm after receipt.",
    badge: null,
    disabled: false,
  },
  {
    id: 'cod',
    label: 'Cash on Delivery',
    icon: '💵',
    desc: 'Pay in cash when your order arrives at your door.',
    badge: null,
    disabled: false,
  },
];

// ─── Helpers ───────────────────────────────────────────────────
function FieldError({ msg }) {
  if (!msg) return null;
  return <span className={styles.fieldErr}><span>⚠</span>{msg}</span>;
}

function FormInput({ id, label, required, error, hint, children, ...props }) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}{required && <span className={styles.req}>*</span>}
      </label>
      {children || (
        <input
          id={id}
          className={`${styles.input} ${error ? styles.inputErr : ''}`}
          {...props}
        />
      )}
      {hint && !error && <span className={styles.hint}>{hint}</span>}
      <FieldError msg={error} />
    </div>
  );
}

// ─── Step indicator ────────────────────────────────────────────
const STEPS = [
  { label: 'Contact',  icon: '👤' },
  { label: 'Delivery', icon: '🚚' },
  { label: 'Payment',  icon: '💳' },
  { label: 'Review',   icon: '✅' },
];

function StepBar({ current }) {
  return (
    <div className={styles.stepBar} role="list" aria-label="Checkout steps">
      {STEPS.map((s, i) => {
        const done    = i < current;
        const active  = i === current;
        return (
          <div key={s.label} className={styles.stepItem} role="listitem">
            <div className={`${styles.stepCircle} ${done ? styles.stepDone : active ? styles.stepActive : ''}`}>
              {done ? '✓' : s.icon}
            </div>
            <span className={`${styles.stepLabel} ${active ? styles.stepLabelActive : ''}`}>{s.label}</span>
            {i < STEPS.length - 1 && (
              <div className={`${styles.stepLine} ${done ? styles.stepLineDone : ''}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Section wrapper ───────────────────────────────────────────
function Section({ icon, title, children, badge }) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHead}>
        <span className={styles.sectionIcon}>{icon}</span>
        <h2 className={styles.sectionTitle}>{title}</h2>
        {badge && <span className={styles.sectionBadge}>{badge}</span>}
      </div>
      {children}
    </div>
  );
}

// ─── Order Summary sidebar ─────────────────────────────────────
function OrderSummary({ cartItems, cartSubtotal, couponDiscount, appliedCoupon, deliveryFee, cartTotal }) {
  const finalDelivery = deliveryFee;
  const finalTotal    = Math.max(0, cartSubtotal - couponDiscount) + finalDelivery;

  return (
    <aside className={styles.summary}>
      <h2 className={styles.summaryTitle}>Order Summary</h2>

      {/* Item list */}
      <div className={styles.summaryItems}>
        {cartItems.map(item => (
          <div key={`${item.id}-${item.customization}`} className={styles.summaryItem}>
            <div className={styles.summaryItemImg}>
              <img src={item.images?.[0]} alt={item.name} />
              <span className={styles.summaryItemQty}>{item.quantity}</span>
            </div>
            <div className={styles.summaryItemInfo}>
              <span className={styles.summaryItemName}>{item.name}</span>
              {item.customization && (
                <span className={styles.summaryItemCustom}>✏️ {item.customization}</span>
              )}
            </div>
            <span className={styles.summaryItemPrice}>Rs.&nbsp;{(item.price * item.quantity).toLocaleString()}</span>
          </div>
        ))}
      </div>

      <div className={styles.summaryDivider} />

      {/* Totals */}
      <div className={styles.summaryRows}>
        <div className={styles.summaryRow}>
          <span>Subtotal</span>
          <span>Rs. {cartSubtotal.toLocaleString()}</span>
        </div>
        {couponDiscount > 0 && (
          <div className={`${styles.summaryRow} ${styles.discountRow}`}>
            <span>Discount {appliedCoupon && <span className={styles.couponBadge}>{appliedCoupon.code}</span>}</span>
            <span>− Rs. {couponDiscount.toLocaleString()}</span>
          </div>
        )}
        <div className={styles.summaryRow}>
          <span>Delivery</span>
          <span className={finalDelivery === 0 ? styles.freeTag : ''}>
            {finalDelivery === 0 ? 'Free 🎉' : `Rs. ${finalDelivery}`}
          </span>
        </div>
        <div className={styles.summaryDivider} />
        <div className={`${styles.summaryRow} ${styles.totalRow}`}>
          <span>Total</span>
          <span className={styles.totalAmt}>Rs. {finalTotal.toLocaleString()}</span>
        </div>
        {couponDiscount > 0 && (
          <p className={styles.savingNote}>🎉 You save Rs. {couponDiscount.toLocaleString()} on this order!</p>
        )}
      </div>

      {/* Trust badges */}
      <div className={styles.trustGrid}>
        {['🔒 Secure Checkout', '💝 Gift Wrapped', '📦 Track Your Order', '✅ Quality Checked'].map(t => (
          <span key={t} className={styles.trustBadge}>{t}</span>
        ))}
      </div>
    </aside>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function Checkout() {
  const navigate = useNavigate();
  const {
    cartItems, cartSubtotal, couponDiscount, appliedCoupon,
    shipping: contextShipping, cartTotal, clearCart,
  } = useCart();

  const [step, setStep] = useState(0);   // 0=Contact 1=Delivery 2=Payment 3=Review
  const [placing, setPlacing] = useState(false);
  const confirmingRef = useRef(false);  // prevents redirect guard during order submission

  // Form data
  const [form, setForm] = useState({
    fullName:    '',
    phone:       '',
    email:       '',
    address:     '',
    city:        '',
    province:    '',
    district:    '',
    postalCode:  '',
    notes:       '',
    delivery:    'standard',
    payment:     'bank',
  });

  const [errors, setErrors] = useState({});

  // Redirect if cart is empty — but NOT while submitting an order
  useEffect(() => {
    if (cartItems.length === 0 && !confirmingRef.current) navigate('/cart');
  }, [cartItems, navigate]);

  // Computed delivery fee
  const deliveryOption = DELIVERY_OPTIONS.find(d => d.id === form.delivery);
  const deliveryFee    = deliveryOption
    ? (deliveryOption.freeover && cartSubtotal >= deliveryOption.freeover ? 0 : deliveryOption.fee)
    : 0;

  const finalSubtotal  = Math.max(0, cartSubtotal - couponDiscount);
  const finalTotal     = finalSubtotal + deliveryFee;

  // ── Validation ─────────────────────────────────────────────
  const VALIDATORS = {
    0: () => {
      const e = {};
      if (!form.fullName.trim())                          e.fullName  = 'Full name is required.';
      if (!/^0[0-9]{9}$/.test(form.phone.replace(/\s/g,'')))
                                                          e.phone     = 'Enter a valid Sri Lankan phone number (e.g. 0771234567).';
      if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
                                                          e.email     = 'Enter a valid email address.';
      if (!form.address.trim())                           e.address   = 'Delivery address is required.';
      if (!form.city.trim())                              e.city      = 'City is required.';
      if (!form.province)                                 e.province  = 'Please select a province.';
      if (!form.district)                                 e.district  = 'Please select a district.';
      return e;
    },
    1: () => ({}),   // delivery — always valid (radio)
    2: () => ({}),   // payment  — always valid (radio)
    3: () => ({}),   // review   — no extra fields
  };

  const validate = (stepIdx = step) => {
    const e = VALIDATORS[stepIdx]?.() || {};
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (name, value) => {
    setForm(f => {
      const updated = { ...f, [name]: value };
      // Reset district when province changes
      if (name === 'province') updated.district = '';
      return updated;
    });
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleNext = () => {
    if (validate(step)) setStep(s => s + 1);
  };

  const handleBack = () => setStep(s => s - 1);

  const handlePlaceOrder = useCallback(() => {
    setPlacing(true);
    confirmingRef.current = true;  // suppress the empty-cart redirect

    // Generate IMO-YYYY-NNNNN format order number
    const year    = new Date().getFullYear();
    const seq     = String(Math.floor(10000 + Math.random() * 90000));
    const orderNumber = `IMO-${year}-${seq}`;

    // Build full order snapshot to pass to confirmation page
    const orderSnapshot = {
      orderNumber,
      customerName: form.fullName,
      phone:        form.phone,
      email:        form.email,
      address:      form.address,
      city:         form.city,
      district:     form.district,
      province:     form.province,
      postalCode:   form.postalCode,
      notes:        form.notes,
      deliveryType: form.delivery,
      paymentMethod:form.payment,
      items:        cartItems.map(i => ({
        id:            i.id,
        name:          i.name,
        category:      i.category,
        price:         i.price,
        quantity:      i.quantity,
        customization: i.customization,
        images:        i.images,
      })),
      subtotal:       cartSubtotal,
      couponDiscount: couponDiscount,
      deliveryFee:    deliveryFee,
      total:          finalTotal,
      placedAt:       new Date().toISOString(),
    };

    setTimeout(() => {
      clearCart();
      navigate('/order-confirmation', { state: { order: orderSnapshot } });
    }, 1200);
  }, [form, cartItems, cartSubtotal, couponDiscount, deliveryFee, finalTotal, clearCart, navigate]);

  if (cartItems.length === 0) return null;

  const districts = form.province ? DISTRICTS[form.province] || [] : [];

  return (
    <main className={styles.page}>
      <div className="container">

        {/* Page header */}
        <div className={styles.pageHeader}>
          <div>
            <Link to="/cart" className={styles.backLink}>← Back to Cart</Link>
            <h1 className={styles.pageTitle}>Checkout</h1>
          </div>
          <StepBar current={step} />
        </div>

        <div className={styles.layout}>

          {/* ── LEFT: Form panels ── */}
          <div className={styles.formCol}>

            {/* ════ STEP 0: Customer Information ════ */}
            {step === 0 && (
              <>
                <Section icon="👤" title="Contact Information">
                  <div className={styles.fieldGrid2}>
                    <FormInput
                      id="fullName" label="Full Name" required
                      error={errors.fullName}
                      placeholder="e.g. Dilani Perera"
                      name="fullName"
                      value={form.fullName}
                      onChange={e => handleChange('fullName', e.target.value)}
                      autoComplete="name"
                    />
                    <FormInput
                      id="phone" label="Phone Number" required
                      error={errors.phone}
                      placeholder="0771234567"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={e => handleChange('phone', e.target.value)}
                      hint="Sri Lankan mobile number (10 digits)"
                      autoComplete="tel"
                    />
                  </div>
                  <FormInput
                    id="email" label="Email Address" required
                    error={errors.email}
                    placeholder="dilani@email.com"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={e => handleChange('email', e.target.value)}
                    hint="Order confirmation will be sent here"
                    autoComplete="email"
                  />
                </Section>

                <Section icon="📍" title="Delivery Address">
                  <FormInput
                    id="address" label="Street Address" required
                    error={errors.address}
                    placeholder="123/A, Main Street, Nugegoda"
                    name="address"
                    value={form.address}
                    onChange={e => handleChange('address', e.target.value)}
                    autoComplete="street-address"
                  />
                  <div className={styles.fieldGrid2}>
                    <FormInput
                      id="city" label="City / Town" required
                      error={errors.city}
                      placeholder="Colombo"
                      name="city"
                      value={form.city}
                      onChange={e => handleChange('city', e.target.value)}
                      autoComplete="address-level2"
                    />
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="province">
                        Province<span className={styles.req}>*</span>
                      </label>
                      <select
                        id="province"
                        className={`${styles.input} ${errors.province ? styles.inputErr : ''}`}
                        value={form.province}
                        onChange={e => handleChange('province', e.target.value)}
                      >
                        <option value="">Select Province</option>
                        {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                      <FieldError msg={errors.province} />
                    </div>
                  </div>
                  <div className={styles.fieldGrid2}>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="district">
                        District<span className={styles.req}>*</span>
                      </label>
                      <select
                        id="district"
                        className={`${styles.input} ${errors.district ? styles.inputErr : ''}`}
                        value={form.district}
                        onChange={e => handleChange('district', e.target.value)}
                        disabled={!form.province}
                      >
                        <option value="">{form.province ? 'Select District' : '— Select Province first —'}</option>
                        {districts.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <FieldError msg={errors.district} />
                    </div>
                    <FormInput
                      id="postalCode" label="Postal Code"
                      placeholder="00100"
                      name="postalCode"
                      value={form.postalCode}
                      onChange={e => handleChange('postalCode', e.target.value)}
                      maxLength={5}
                      autoComplete="postal-code"
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="notes">
                      Order Notes <span className={styles.optional}>(optional)</span>
                    </label>
                    <textarea
                      id="notes"
                      className={styles.input}
                      value={form.notes}
                      onChange={e => handleChange('notes', e.target.value)}
                      placeholder="Special delivery instructions, landmark, gift message…"
                      rows={3}
                      style={{ resize: 'vertical', minHeight: 80 }}
                    />
                  </div>
                </Section>

                <div className={styles.stepActions}>
                  <Link to="/cart" className={styles.backBtn}>← Back to Cart</Link>
                  <button className={styles.nextBtn} onClick={handleNext}>
                    Continue to Delivery →
                  </button>
                </div>
              </>
            )}

            {/* ════ STEP 1: Delivery ════ */}
            {step === 1 && (
              <>
                <Section icon="🚚" title="Delivery Method">
                  <div className={styles.deliveryOptions}>
                    {DELIVERY_OPTIONS.map(opt => {
                      const isFree = opt.freeover && cartSubtotal >= opt.freeover;
                      const fee    = isFree ? 0 : opt.fee;
                      const active = form.delivery === opt.id;
                      return (
                        <label
                          key={opt.id}
                          className={`${styles.deliveryCard} ${active ? styles.deliveryCardActive : ''}`}
                          htmlFor={`delivery-${opt.id}`}
                        >
                          <input
                            type="radio"
                            id={`delivery-${opt.id}`}
                            name="delivery"
                            value={opt.id}
                            checked={active}
                            onChange={() => handleChange('delivery', opt.id)}
                            className={styles.hiddenRadio}
                          />
                          <div className={styles.deliveryCardIcon}>{opt.icon}</div>
                          <div className={styles.deliveryCardBody}>
                            <strong className={styles.deliveryCardTitle}>{opt.label}</strong>
                            <span className={styles.deliveryCardDuration}>🕐 {opt.duration}</span>
                            <p className={styles.deliveryCardDesc}>{opt.desc}</p>
                          </div>
                          <div className={styles.deliveryCardPrice}>
                            {isFree
                              ? <span className={styles.freeTag}>Free 🎉</span>
                              : <span className={styles.deliveryFeeTag}>Rs. {fee}</span>
                            }
                          </div>
                          <div className={`${styles.deliveryRadioMark} ${active ? styles.deliveryRadioMarkActive : ''}`}>
                            {active && '✓'}
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  {/* Free shipping note */}
                  {form.delivery === 'standard' && cartSubtotal < 2000 && (
                    <div className={styles.shippingNote}>
                      💡 Add <strong>Rs. {(2000 - cartSubtotal).toLocaleString()}</strong> more to your cart for free standard delivery!
                    </div>
                  )}
                </Section>

                <div className={styles.stepActions}>
                  <button className={styles.backBtn} onClick={handleBack}>← Back</button>
                  <button className={styles.nextBtn} onClick={handleNext}>
                    Continue to Payment →
                  </button>
                </div>
              </>
            )}

            {/* ════ STEP 2: Payment ════ */}
            {step === 2 && (
              <>
                <Section icon="💳" title="Payment Method">
                  <div className={styles.paymentOptions}>
                    {PAYMENT_METHODS.map(pm => {
                      const active = form.payment === pm.id;
                      return (
                        <label
                          key={pm.id}
                          className={`${styles.payCard} ${active ? styles.payCardActive : ''} ${pm.disabled ? styles.payCardDisabled : ''}`}
                          htmlFor={`pay-${pm.id}`}
                        >
                          <input
                            type="radio"
                            id={`pay-${pm.id}`}
                            name="payment"
                            value={pm.id}
                            checked={active}
                            onChange={() => !pm.disabled && handleChange('payment', pm.id)}
                            disabled={pm.disabled}
                            className={styles.hiddenRadio}
                          />
                          <span className={styles.payCardIcon}>{pm.icon}</span>
                          <div className={styles.payCardBody}>
                            <strong className={styles.payCardLabel}>{pm.label}</strong>
                            <p className={styles.payCardDesc}>{pm.desc}</p>
                          </div>
                          <div className={styles.payCardRight}>
                            {pm.badge && <span className={styles.payCardBadge}>{pm.badge}</span>}
                            <div className={`${styles.payRadioMark} ${active ? styles.payRadioMarkActive : ''}`}>
                              {active && '✓'}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  {/* Contextual payment info */}
                  {form.payment === 'bank' && (
                    <div className={styles.payInfo}>
                      <h4 className={styles.payInfoTitle}>🏦 Bank Transfer Details</h4>
                      <table className={styles.bankTable}>
                        <tbody>
                          <tr><td>Bank</td><td><strong>Bank of Ceylon</strong></td></tr>
                          <tr><td>Account Name</td><td><strong>IMO Craft</strong></td></tr>
                          <tr><td>Account No.</td><td><strong>XXXX-XXXX-XXXX</strong></td></tr>
                          <tr><td>Branch</td><td><strong>Colombo Fort</strong></td></tr>
                        </tbody>
                      </table>
                      <p className={styles.payInfoNote}>
                        💬 Please send your payment slip via WhatsApp after placing your order. Your order will be confirmed once payment is verified (usually within 2–4 hours).
                      </p>
                    </div>
                  )}

                  {form.payment === 'cod' && (
                    <div className={styles.payInfo}>
                      <h4 className={styles.payInfoTitle}>💵 Cash on Delivery</h4>
                      <p className={styles.payInfoNote}>
                        Pay the exact amount in cash to the delivery agent when your order arrives. Please ensure someone is available to receive the parcel. A confirmation call may be made before delivery.
                      </p>
                    </div>
                  )}

                  {form.payment === 'card' && (
                    <div className={`${styles.payInfo} ${styles.payInfoDisabled}`}>
                      <h4 className={styles.payInfoTitle}>💳 Card Payment</h4>
                      <p className={styles.payInfoNote}>
                        Secure card payment integration is coming soon. Please use Bank Transfer or Cash on Delivery for now.
                      </p>
                    </div>
                  )}

                  {/* Security note */}
                  <div className={styles.securityNote}>
                    🔒 <strong>Secure &amp; Safe:</strong> We never store your card details. All payments are processed through secure channels.
                  </div>
                </Section>

                <div className={styles.stepActions}>
                  <button className={styles.backBtn} onClick={handleBack}>← Back</button>
                  <button
                    className={styles.nextBtn}
                    onClick={handleNext}
                    disabled={form.payment === 'card'}
                  >
                    Review Order →
                  </button>
                </div>
              </>
            )}

            {/* ════ STEP 3: Review & Confirm ════ */}
            {step === 3 && (
              <>
                {/* Shipping summary */}
                <Section icon="📋" title="Order Review">
                  <div className={styles.reviewGrid}>

                    {/* Customer info */}
                    <div className={styles.reviewBlock}>
                      <div className={styles.reviewBlockHead}>
                        <span>👤 Contact & Address</span>
                        <button className={styles.editLink} onClick={() => setStep(0)}>Edit</button>
                      </div>
                      <p className={styles.reviewLine}><strong>{form.fullName}</strong></p>
                      <p className={styles.reviewLine}>{form.address}</p>
                      <p className={styles.reviewLine}>{form.city}, {form.district}, {form.province}</p>
                      {form.postalCode && <p className={styles.reviewLine}>Postal: {form.postalCode}</p>}
                      <p className={styles.reviewLine}>📞 {form.phone}</p>
                      <p className={styles.reviewLine}>✉️ {form.email}</p>
                      {form.notes && (
                        <p className={`${styles.reviewLine} ${styles.reviewNote}`}>📝 {form.notes}</p>
                      )}
                    </div>

                    {/* Delivery */}
                    <div className={styles.reviewBlock}>
                      <div className={styles.reviewBlockHead}>
                        <span>🚚 Delivery</span>
                        <button className={styles.editLink} onClick={() => setStep(1)}>Edit</button>
                      </div>
                      <p className={styles.reviewLine}>
                        <strong>{deliveryOption?.label}</strong>
                      </p>
                      <p className={styles.reviewLine}>🕐 {deliveryOption?.duration}</p>
                      <p className={styles.reviewLine}>
                        Fee: {deliveryFee === 0 ? <span className={styles.freeTag}>Free 🎉</span> : `Rs. ${deliveryFee}`}
                      </p>
                    </div>

                    {/* Payment */}
                    <div className={styles.reviewBlock}>
                      <div className={styles.reviewBlockHead}>
                        <span>💳 Payment</span>
                        <button className={styles.editLink} onClick={() => setStep(2)}>Edit</button>
                      </div>
                      <p className={styles.reviewLine}>
                        <strong>{PAYMENT_METHODS.find(p => p.id === form.payment)?.label}</strong>
                      </p>
                      <p className={styles.reviewLine}>
                        {PAYMENT_METHODS.find(p => p.id === form.payment)?.desc}
                      </p>
                    </div>
                  </div>
                </Section>

                {/* Items in order */}
                <Section icon="🛍️" title="Your Items" badge={`${cartItems.length} item${cartItems.length !== 1 ? 's' : ''}`}>
                  <div className={styles.reviewItems}>
                    {cartItems.map(item => (
                      <div key={`${item.id}-${item.customization}`} className={styles.reviewItem}>
                        <img src={item.images?.[0]} alt={item.name} className={styles.reviewItemImg} />
                        <div className={styles.reviewItemInfo}>
                          <span className={styles.reviewItemName}>{item.name}</span>
                          {item.customization && (
                            <span className={styles.reviewItemCustom}>✏️ {item.customization}</span>
                          )}
                          <span className={styles.reviewItemQty}>Qty: {item.quantity}</span>
                        </div>
                        <span className={styles.reviewItemPrice}>
                          Rs. {(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </Section>

                {/* Totals recap */}
                <div className={styles.reviewTotals}>
                  <div className={styles.reviewTotalsRow}>
                    <span>Subtotal</span><span>Rs. {cartSubtotal.toLocaleString()}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className={`${styles.reviewTotalsRow} ${styles.reviewDiscount}`}>
                      <span>Discount</span><span>− Rs. {couponDiscount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className={styles.reviewTotalsRow}>
                    <span>Delivery</span>
                    <span>{deliveryFee === 0 ? 'Free 🎉' : `Rs. ${deliveryFee}`}</span>
                  </div>
                  <div className={`${styles.reviewTotalsRow} ${styles.reviewTotal}`}>
                    <span>Total</span>
                    <span>Rs. {finalTotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* Place order */}
                <div className={styles.stepActions}>
                  <button className={styles.backBtn} onClick={handleBack} disabled={placing}>
                    ← Back
                  </button>
                  <button
                    className={`${styles.placeBtn} ${placing ? styles.placeBtnLoading : ''}`}
                    onClick={handlePlaceOrder}
                    disabled={placing}
                  >
                    {placing
                      ? <><span className={styles.spinner} />Placing Order…</>
                      : '🎉 Place Order'
                    }
                  </button>
                </div>
              </>
            )}
          </div>

          {/* ── RIGHT: Order Summary ── */}
          <OrderSummary
            cartItems={cartItems}
            cartSubtotal={cartSubtotal}
            couponDiscount={couponDiscount}
            appliedCoupon={appliedCoupon}
            deliveryFee={deliveryFee}
            cartTotal={cartTotal}
          />
        </div>
      </div>
    </main>
  );
}
