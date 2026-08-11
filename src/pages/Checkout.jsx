import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Button from '../components/ui/Button';
import styles from './Checkout.module.css';

const STEPS = ['Your Info', 'Review & Confirm'];

function StepIndicator({ currentStep }) {
  return (
    <div className={styles.steps}>
      {STEPS.map((step, i) => (
        <div key={step} className={styles.stepRow}>
          <div className={`${styles.step} ${i <= currentStep ? styles.stepActive : ''} ${i < currentStep ? styles.stepDone : ''}`}>
            <div className={styles.stepCircle}>
              {i < currentStep ? '✓' : i + 1}
            </div>
            <span className={styles.stepLabel}>{step}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`${styles.stepLine} ${i < currentStep ? styles.stepLineDone : ''}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, cartTotal, cartCount, clearCart } = useCart();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', district: '', postalCode: '',
    notes: '', paymentMethod: 'bank',
  });

  const [errors, setErrors] = useState({});

  const shipping = cartTotal > 2000 ? 0 : 200;
  const total = cartTotal + shipping;

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'Required';
    if (!form.lastName.trim()) e.lastName = 'Required';
    if (!form.email.trim() || !form.email.includes('@')) e.email = 'Valid email required';
    if (!form.phone.trim() || form.phone.length < 9) e.phone = 'Valid phone required';
    if (!form.address.trim()) e.address = 'Required';
    if (!form.city.trim()) e.city = 'Required';
    if (!form.district.trim()) e.district = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: '' }));
    }
  };

  const handleNext = () => {
    if (validate()) setStep(1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const orderNum = 'IMO' + Math.random().toString(36).substr(2, 6).toUpperCase();
    clearCart();
    setSubmitted(true);
    setTimeout(() => navigate(`/order-tracking?order=${orderNum}`), 500);
  };

  if (cartItems.length === 0 && !submitted) {
    navigate('/cart');
    return null;
  }

  return (
    <main className={styles.checkoutPage}>
      <div className="container">
        <div className={styles.pageHeader}>
          <h1 className={styles.title}>Checkout</h1>
          <StepIndicator currentStep={step} />
        </div>

        <div className={styles.layout}>
          {/* Form */}
          <div className={styles.formArea}>
            {step === 0 && (
              <div className={styles.formCard}>
                <h2 className={styles.sectionTitle}>📦 Shipping Information</h2>
                <form className={styles.form} onSubmit={e => { e.preventDefault(); handleNext(); }}>
                  <div className={styles.formRow}>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="firstName">First Name *</label>
                      <input
                        id="firstName"
                        name="firstName"
                        className={`${styles.input} ${errors.firstName ? styles.inputError : ''}`}
                        value={form.firstName}
                        onChange={handleChange}
                        placeholder="Dilani"
                      />
                      {errors.firstName && <span className={styles.error}>{errors.firstName}</span>}
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="lastName">Last Name *</label>
                      <input
                        id="lastName"
                        name="lastName"
                        className={`${styles.input} ${errors.lastName ? styles.inputError : ''}`}
                        value={form.lastName}
                        onChange={handleChange}
                        placeholder="Perera"
                      />
                      {errors.lastName && <span className={styles.error}>{errors.lastName}</span>}
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="email">Email Address *</label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                        value={form.email}
                        onChange={handleChange}
                        placeholder="dilani@email.com"
                      />
                      {errors.email && <span className={styles.error}>{errors.email}</span>}
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="phone">Phone Number *</label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="07X XXX XXXX"
                      />
                      {errors.phone && <span className={styles.error}>{errors.phone}</span>}
                    </div>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="address">Address *</label>
                    <input
                      id="address"
                      name="address"
                      className={`${styles.input} ${errors.address ? styles.inputError : ''}`}
                      value={form.address}
                      onChange={handleChange}
                      placeholder="123/A, Main Street"
                    />
                    {errors.address && <span className={styles.error}>{errors.address}</span>}
                  </div>

                  <div className={styles.formRow3}>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="city">City *</label>
                      <input
                        id="city"
                        name="city"
                        className={`${styles.input} ${errors.city ? styles.inputError : ''}`}
                        value={form.city}
                        onChange={handleChange}
                        placeholder="Colombo"
                      />
                      {errors.city && <span className={styles.error}>{errors.city}</span>}
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="district">District *</label>
                      <select
                        id="district"
                        name="district"
                        className={`${styles.input} ${errors.district ? styles.inputError : ''}`}
                        value={form.district}
                        onChange={handleChange}
                      >
                        <option value="">Select District</option>
                        {['Colombo','Gampaha','Kandy','Galle','Matara','Jaffna','Anuradhapura',
                          'Ratnapura','Badulla','Kurunegala','Puttalam','Trincomalee','Batticaloa',
                          'Ampara','Kegalle','Nuwara Eliya','Monaragala','Hambantota','Polonnaruwa',
                          'Vavuniya','Mannar','Mullativu','Killinochchi'].map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                      {errors.district && <span className={styles.error}>{errors.district}</span>}
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="postalCode">Postal Code</label>
                      <input
                        id="postalCode"
                        name="postalCode"
                        className={styles.input}
                        value={form.postalCode}
                        onChange={handleChange}
                        placeholder="00100"
                      />
                    </div>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="notes">Order Notes (optional)</label>
                    <textarea
                      id="notes"
                      name="notes"
                      className={`${styles.input} ${styles.textarea}`}
                      value={form.notes}
                      onChange={handleChange}
                      placeholder="Any special instructions for your order..."
                      rows={3}
                    />
                  </div>

                  {/* Payment Method */}
                  <div className={styles.paymentSection}>
                    <h3 className={styles.paymentTitle}>Payment Method</h3>
                    <div className={styles.paymentOptions}>
                      {[
                        { value: 'bank', label: '🏦 Bank Transfer', desc: 'Pay via bank transfer – we\'ll send account details' },
                        { value: 'cash', label: '💵 Cash on Delivery', desc: 'Pay when you receive your order' },
                        { value: 'online', label: '📱 Online Payment', desc: 'FriMi, Genie, eZ Cash, etc.' },
                      ].map(p => (
                        <label key={p.value} className={`${styles.payOption} ${form.paymentMethod === p.value ? styles.payOptionActive : ''}`}>
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={p.value}
                            checked={form.paymentMethod === p.value}
                            onChange={handleChange}
                            className={styles.radioInput}
                          />
                          <div>
                            <strong>{p.label}</strong>
                            <p>{p.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <Button type="submit" variant="primary" size="lg" fullWidth>
                    Review Order →
                  </Button>
                </form>
              </div>
            )}

            {step === 1 && (
              <div className={styles.formCard}>
                <h2 className={styles.sectionTitle}>✅ Review Your Order</h2>

                <div className={styles.reviewSection}>
                  <h3 className={styles.reviewHeading}>Shipping To</h3>
                  <div className={styles.reviewDetails}>
                    <p><strong>{form.firstName} {form.lastName}</strong></p>
                    <p>{form.address}, {form.city}, {form.district} {form.postalCode}</p>
                    <p>📞 {form.phone}</p>
                    <p>✉️ {form.email}</p>
                    {form.notes && <p className={styles.notes}>📝 {form.notes}</p>}
                  </div>
                  <button className={styles.editBtn} onClick={() => setStep(0)}>← Edit Info</button>
                </div>

                <div className={styles.reviewSection}>
                  <h3 className={styles.reviewHeading}>Items</h3>
                  {cartItems.map(item => (
                    <div key={`${item.id}-${item.customization}`} className={styles.reviewItem}>
                      <img src={item.images[0]} alt={item.name} className={styles.reviewImg} />
                      <div className={styles.reviewItemDetails}>
                        <strong>{item.name}</strong>
                        {item.customization && <span className={styles.reviewCustom}>✏️ {item.customization}</span>}
                        <span>Qty: {item.quantity}</span>
                      </div>
                      <span className={styles.reviewPrice}>Rs. {(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSubmit}>
                  <div className={styles.actionRow}>
                    <Button type="button" variant="ghost" size="lg" onClick={() => setStep(0)}>
                      ← Back
                    </Button>
                    <Button type="submit" variant="primary" size="lg" style={{ flex: 1 }}>
                      🎉 Place Order
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Summary Sidebar */}
          <aside className={styles.summary}>
            <h2 className={styles.summaryTitle}>Order Summary</h2>
            {cartItems.map(item => (
              <div key={`${item.id}-${item.customization}`} className={styles.summaryItem}>
                <span className={styles.summaryItemName}>{item.name} × {item.quantity}</span>
                <span>Rs. {(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
            <div className={styles.summaryDivider} />
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>Rs. {cartTotal.toLocaleString()}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Shipping</span>
              <span className={shipping === 0 ? styles.freeShipping : ''}>
                {shipping === 0 ? 'Free 🎉' : `Rs. ${shipping}`}
              </span>
            </div>
            <div className={`${styles.summaryRow} ${styles.totalRow}`}>
              <span>Total</span>
              <span>Rs. {total.toLocaleString()}</span>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
