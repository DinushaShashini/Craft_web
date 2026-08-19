import styles from './Badge.module.css';

const colorMap = {
  // Order status
  Pending:    'orange',
  Processing: 'blue',
  Shipped:    'purple',
  Delivered:  'green',
  Cancelled:  'red',
  // Payment
  Paid:       'green',
  Unpaid:     'red',
  Refunded:   'grey',
  Completed:  'green',
  // Review
  Published:  'green',
  // Delivery
  'In Transit': 'blue',
  // Generic
  Active:     'green',
  Inactive:   'grey',
  Low:        'red',
};

export default function Badge({ label, color }) {
  const c = color || colorMap[label] || 'grey';
  return <span className={`${styles.badge} ${styles[c]}`}>{label}</span>;
}
