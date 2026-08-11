import { useState } from 'react';
import Button from '../components/ui/Button';
import styles from './Contact.module.css';

const faqs = [
  {
    q: 'How long does delivery take?',
    a: 'Standard delivery takes 3-5 business days within Sri Lanka. Express delivery (1-2 days) is available for an additional fee.',
  },
  {
    q: 'Can I customize my order?',
    a: 'Absolutely! Many of our products are customizable. You can add your name, choose colors, or request special designs. Just let us know in the order notes or WhatsApp us.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept bank transfers, cash on delivery, and popular mobile payment apps like FriMi and Genie.',
  },
  {
    q: 'Do you offer gift wrapping?',
    a: 'Yes! All orders come in beautiful packaging. We can also add a personalized handwritten note for free.',
  },
  {
    q: 'What is your return policy?',
    a: 'Due to the handmade nature of our products, we do not accept returns. However, if your item arrives damaged, please contact us within 48 hours and we\'ll make it right.',
  },
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Please enter your name';
    if (!form.email.trim() || !form.email.includes('@')) e.email = 'Enter a valid email';
    if (!form.message.trim() || form.message.length < 10) e.message = 'Message must be at least 10 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(p => ({ ...p, [e.target.name]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      setSubmitted(true);
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    }
  };

  return (
    <main>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className="container">
          <span className="section-tag">We'd Love to Hear from You</span>
          <h1 className={styles.pageTitle}>Contact Us</h1>
          <p className={styles.pageSub}>Have a question, custom order request, or just want to say hi? We're here for you!</p>
        </div>
      </div>

      <div className="container">
        <div className={styles.layout}>
          {/* Contact Form */}
          <div className={styles.formCard}>
            <h2 className={styles.formTitle}>Send Us a Message</h2>

            {submitted ? (
              <div className={styles.successState}>
                <span className={styles.successIcon}>✅</span>
                <h3>Message Sent!</h3>
                <p>Thank you for reaching out! We'll get back to you within 24 hours.</p>
                <Button variant="primary" size="md" onClick={() => setSubmitted(false)}>
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.formRow}>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="contact-name">Your Name *</label>
                    <input
                      id="contact-name"
                      name="name"
                      className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Dilani Perera"
                    />
                    {errors.name && <span className={styles.error}>{errors.name}</span>}
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="contact-email">Email Address *</label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                      value={form.email}
                      onChange={handleChange}
                      placeholder="dilani@email.com"
                    />
                    {errors.email && <span className={styles.error}>{errors.email}</span>}
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="contact-phone">Phone Number</label>
                    <input
                      id="contact-phone"
                      name="phone"
                      type="tel"
                      className={styles.input}
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="07X XXX XXXX"
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="contact-subject">Subject</label>
                    <select
                      id="contact-subject"
                      name="subject"
                      className={styles.input}
                      value={form.subject}
                      onChange={handleChange}
                    >
                      <option value="">Select a topic</option>
                      <option value="custom">Custom Order</option>
                      <option value="product">Product Inquiry</option>
                      <option value="order">Order Status</option>
                      <option value="bulk">Bulk Order</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="contact-message">Message *</label>
                  <textarea
                    id="contact-message"
                    name="message"
                    className={`${styles.input} ${styles.textarea} ${errors.message ? styles.inputError : ''}`}
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Tell us about your custom order or ask us anything..."
                    rows={5}
                  />
                  {errors.message && <span className={styles.error}>{errors.message}</span>}
                </div>

                <Button type="submit" variant="primary" size="lg" fullWidth>
                  Send Message ✉️
                </Button>
              </form>
            )}
          </div>

          {/* Info Sidebar */}
          <aside className={styles.infoSidebar}>
            {/* Contact Methods */}
            <div className={styles.infoCard}>
              <h3 className={styles.infoTitle}>Get in Touch</h3>
              <div className={styles.contactMethods}>
                <a
                  href="https://wa.me/94XXXXXXXXX"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.contactMethod} ${styles.whatsapp}`}
                >
                  <span className={styles.methodIcon}>💬</span>
                  <div>
                    <strong>WhatsApp</strong>
                    <span>+94 XXX XXX XXX</span>
                    <small>Fastest response!</small>
                  </div>
                </a>
                <a href="mailto:hello@imocraft.lk" className={styles.contactMethod}>
                  <span className={styles.methodIcon}>✉️</span>
                  <div>
                    <strong>Email</strong>
                    <span>hello@imocraft.lk</span>
                  </div>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className={styles.contactMethod}>
                  <span className={styles.methodIcon}>📷</span>
                  <div>
                    <strong>Instagram</strong>
                    <span>@imo.craft</span>
                  </div>
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className={styles.contactMethod}>
                  <span className={styles.methodIcon}>📘</span>
                  <div>
                    <strong>Facebook</strong>
                    <span>IMO Craft</span>
                  </div>
                </a>
              </div>
            </div>

            {/* Hours */}
            <div className={styles.infoCard}>
              <h3 className={styles.infoTitle}>⏰ Working Hours</h3>
              <div className={styles.hours}>
                <div className={styles.hoursRow}>
                  <span>Monday – Friday</span>
                  <span>9:00 AM – 7:00 PM</span>
                </div>
                <div className={styles.hoursRow}>
                  <span>Saturday</span>
                  <span>10:00 AM – 5:00 PM</span>
                </div>
                <div className={styles.hoursRow}>
                  <span>Sunday</span>
                  <span>Closed</span>
                </div>
              </div>
              <p className={styles.hoursNote}>We typically reply within 2-4 hours during working hours.</p>
            </div>

            {/* Location */}
            <div className={styles.infoCard}>
              <h3 className={styles.infoTitle}>📍 Location</h3>
              <p className={styles.location}>Sri Lanka</p>
              <p className={styles.locationNote}>We deliver island-wide via courier service.</p>
            </div>
          </aside>
        </div>

        {/* FAQ Section */}
        <section className={styles.faqSection}>
          <div className="section-header">
            <span className="section-tag">Quick Answers</span>
            <h2 className="section-title">Frequently Asked Questions</h2>
            <div className="divider" />
          </div>
          <div className={styles.faqList}>
            {faqs.map((faq, i) => (
              <div key={i} className={`${styles.faqItem} ${openFaq === i ? styles.faqOpen : ''}`}>
                <button
                  className={styles.faqQuestion}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                >
                  <span>{faq.q}</span>
                  <span className={styles.faqChevron}>{openFaq === i ? '▲' : '▼'}</span>
                </button>
                <div className={styles.faqAnswer}>
                  <p>{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
