import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import styles from './Settings.module.css';

const TABS = ['Store', 'Shipping', 'Payments', 'Notifications', 'Account'];

export default function Settings() {
  const [tab, setTab]     = useState('Store');
  const [saved, setSaved] = useState(false);

  const [store, setStore] = useState({
    name: 'IMO Craft', email: 'imocraft@gmail.com', phone: '0771234567',
    address: 'Colombo, Sri Lanka', currency: 'LKR', timezone: 'Asia/Colombo',
    logo: '', about: 'Handmade resin crafts and personalized gifts.',
  });

  const [shipping, setShipping] = useState({
    flatRate: '200', freeThreshold: '2000', enableCOD: true, enableBankTransfer: true,
    courierNote: 'Lanka Courier, DHL Lanka',
  });

  const [notif, setNotif] = useState({
    emailOnOrder: true, emailOnDelivery: true, emailLowStock: true, smsOnOrder: false,
    adminEmail: 'admin@imocraft.lk',
  });

  const [account, setAccount] = useState({
    username: 'admin', currentPw: '', newPw: '', confirmPw: '',
  });

  function handleSave(e) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage store configuration" />

      <div className={styles.layout}>
        {/* Sidebar tabs */}
        <nav className={styles.tabs}>
          {TABS.map(t => (
            <button
              key={t}
              className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className={styles.panel}>
          {saved && <div className={styles.savedBanner}>✅ Settings saved successfully.</div>}

          <form onSubmit={handleSave} className={styles.form}>

            {tab === 'Store' && (
              <>
                <h3 className={styles.sectionTitle}>Store Information</h3>
                <div className={styles.grid2}>
                  <Field label="Store Name"    value={store.name}     onChange={v => setStore(s => ({...s, name: v}))} />
                  <Field label="Contact Email" value={store.email}    onChange={v => setStore(s => ({...s, email: v}))} type="email" />
                  <Field label="Phone"         value={store.phone}    onChange={v => setStore(s => ({...s, phone: v}))} />
                  <Field label="Address"       value={store.address}  onChange={v => setStore(s => ({...s, address: v}))} />
                  <Field label="Currency"      value={store.currency} onChange={v => setStore(s => ({...s, currency: v}))} />
                  <Field label="Timezone"      value={store.timezone} onChange={v => setStore(s => ({...s, timezone: v}))} />
                </div>
                <Field label="About / Description" value={store.about}
                  onChange={v => setStore(s => ({...s, about: v}))} multiline />
              </>
            )}

            {tab === 'Shipping' && (
              <>
                <h3 className={styles.sectionTitle}>Shipping Configuration</h3>
                <div className={styles.grid2}>
                  <Field label="Flat Rate (Rs.)"            value={shipping.flatRate}      onChange={v => setShipping(s => ({...s, flatRate: v}))}      type="number" />
                  <Field label="Free Shipping Threshold (Rs.)" value={shipping.freeThreshold} onChange={v => setShipping(s => ({...s, freeThreshold: v}))} type="number" />
                  <Field label="Courier Partners"           value={shipping.courierNote}   onChange={v => setShipping(s => ({...s, courierNote: v}))} />
                </div>
                <Toggle label="Enable Cash on Delivery"  checked={shipping.enableCOD}          onChange={v => setShipping(s => ({...s, enableCOD: v}))} />
                <Toggle label="Enable Bank Transfer"     checked={shipping.enableBankTransfer}  onChange={v => setShipping(s => ({...s, enableBankTransfer: v}))} />
              </>
            )}

            {tab === 'Payments' && (
              <>
                <h3 className={styles.sectionTitle}>Payment Methods</h3>
                <div className={styles.infoBox}>
                  Payment gateway integrations (Stripe, PayHere, etc.) will be configured here once the backend is connected.
                </div>
                <Toggle label="Cash on Delivery"   checked={shipping.enableCOD}           onChange={v => setShipping(s => ({...s, enableCOD: v}))} />
                <Toggle label="Bank Transfer"      checked={shipping.enableBankTransfer}   onChange={v => setShipping(s => ({...s, enableBankTransfer: v}))} />
              </>
            )}

            {tab === 'Notifications' && (
              <>
                <h3 className={styles.sectionTitle}>Email &amp; SMS Notifications</h3>
                <Field label="Admin Notification Email" value={notif.adminEmail}
                  onChange={v => setNotif(n => ({...n, adminEmail: v}))} type="email" />
                <div className={styles.toggleGroup}>
                  <Toggle label="Email on new order"         checked={notif.emailOnOrder}    onChange={v => setNotif(n => ({...n, emailOnOrder: v}))} />
                  <Toggle label="Email on delivery update"   checked={notif.emailOnDelivery} onChange={v => setNotif(n => ({...n, emailOnDelivery: v}))} />
                  <Toggle label="Email on low stock alert"   checked={notif.emailLowStock}   onChange={v => setNotif(n => ({...n, emailLowStock: v}))} />
                  <Toggle label="SMS on new order"           checked={notif.smsOnOrder}      onChange={v => setNotif(n => ({...n, smsOnOrder: v}))} />
                </div>
              </>
            )}

            {tab === 'Account' && (
              <>
                <h3 className={styles.sectionTitle}>Admin Account</h3>
                <div className={styles.grid2}>
                  <Field label="Username" value={account.username} onChange={v => setAccount(a => ({...a, username: v}))} />
                </div>
                <h4 className={styles.subTitle}>Change Password</h4>
                <div className={styles.grid2}>
                  <Field label="Current Password" value={account.currentPw} onChange={v => setAccount(a => ({...a, currentPw: v}))} type="password" />
                  <Field label="New Password"      value={account.newPw}     onChange={v => setAccount(a => ({...a, newPw: v}))}     type="password" />
                  <Field label="Confirm Password"  value={account.confirmPw} onChange={v => setAccount(a => ({...a, confirmPw: v}))} type="password" />
                </div>
              </>
            )}

            <div className={styles.formActions}>
              <button type="submit" className={styles.saveBtn}>Save Settings</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', multiline }) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      {multiline
        ? <textarea className={styles.textarea} rows={3} value={value} onChange={e => onChange(e.target.value)} />
        : <input className={styles.input} type={type} value={value} onChange={e => onChange(e.target.value)} />
      }
    </div>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className={styles.toggle}>
      <span className={styles.toggleLabel}>{label}</span>
      <div className={`${styles.switch} ${checked ? styles.switchOn : ''}`}
        onClick={() => onChange(!checked)} role="checkbox" aria-checked={checked} tabIndex={0}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onChange(!checked); }}>
        <div className={styles.switchThumb} />
      </div>
    </label>
  );
}
