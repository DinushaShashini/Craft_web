import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Button from '../components/ui/Button';
import styles from './OrderTracking.module.css';

const ORDER_STATUSES = [
  { key: 'placed', label: 'Order Placed', icon: '📋', desc: 'Your order has been received and confirmed.' },
  { key: 'crafting', label: 'Being Crafted', icon: '✂️', desc: 'Our artisans are handcrafting your items with love.' },
  { key: 'ready', label: 'Ready to Ship', icon: '📦', desc: 'Your order is packed and ready for dispatch.' },
  { key: 'shipped', label: 'Shipped', icon: '🚚', desc: 'Your order is on its way to you!' },
  { key: 'delivered', label: 'Delivered', icon: '🎉', desc: 'Your order has been delivered. Enjoy your IMO Craft pieces!' },
];

function getMockOrderData(orderNum) {
  if (!orderNum) return null;
  // Simulate order status based on order number hash
  const hash = orderNum.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const statusIndex = hash % 5;
  return {
    orderNumber: orderNum,
    status: ORDER_STATUSES[statusIndex].key,
    statusIndex,
    date: new Date(Date.now() - (4 - statusIndex) * 24 * 60 * 60 * 1000).toLocaleDateString('en-LK', {
      year: 'numeric', month: 'long', day: 'numeric'
    }),
    estimatedDelivery: new Date(Date.now() + statusIndex * 24 * 60 * 60 * 1000).toLocaleDateString('en-LK', {
      year: 'numeric', month: 'long', day: 'numeric'
    }),
    items: [
      { name: 'Resin Rose Keychain', qty: 1, price: 450 },
      { name: 'Memory Jar Gift Set', qty: 1, price: 950 },
    ],
    total: 1600,
    shipping: 200,
    address: 'Colombo, Western Province',
  };
}

export default function OrderTracking() {
  const [searchParams] = useSearchParams();
  const [orderInput, setOrderInput] = useState(searchParams.get('order') || '');
  const [searchedOrder, setSearchedOrder] = useState(searchParams.get('order') || '');
  const [order, setOrder] = useState(() => getMockOrderData(searchParams.get('order')));
  const [notFound, setNotFound] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = orderInput.trim().toUpperCase();
    if (!trimmed) return;
    const result = getMockOrderData(trimmed);
    if (result) {
      setOrder(result);
      setSearchedOrder(trimmed);
      setNotFound(false);
    } else {
      setOrder(null);
      setNotFound(true);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.pageHeader}>
        <div className="container">
          <span className="section-tag">Track Your Purchase</span>
          <h1 className={styles.pageTitle}>Order Tracking</h1>
          <p className={styles.pageSub}>Enter your order number to check the status of your handmade order.</p>
        </div>
      </div>

      <div className="container">
        {/* Search Form */}
        <form onSubmit={handleSearch} className={styles.searchCard}>
          <label htmlFor="order-input" className={styles.searchLabel}>
            📋 Order Number
          </label>
          <div className={styles.searchRow}>
            <input
              id="order-input"
              type="text"
              value={orderInput}
              onChange={e => setOrderInput(e.target.value)}
              placeholder="e.g. IMOABC123"
              className={styles.searchInput}
            />
            <Button type="submit" variant="primary" size="md">
              Track Order
            </Button>
          </div>
          <p className={styles.searchHint}>
            Your order number was sent to your email after placing an order.
          </p>
        </form>

        {notFound && (
          <div className={styles.notFound}>
            <span>🔍</span>
            <p>No order found with that number. Please check and try again, or <a href="/contact">contact us</a>.</p>
          </div>
        )}

        {order && (
          <div className={styles.orderCard}>
            {/* Order Header */}
            <div className={styles.orderHeader}>
              <div>
                <h2 className={styles.orderNum}>Order #{order.orderNumber}</h2>
                <p className={styles.orderDate}>Placed on {order.date}</p>
              </div>
              <div className={styles.currentStatus}>
                <span className={styles.statusIcon}>{ORDER_STATUSES[order.statusIndex].icon}</span>
                <span className={styles.statusLabel}>{ORDER_STATUSES[order.statusIndex].label}</span>
              </div>
            </div>

            {/* Timeline */}
            <div className={styles.timeline}>
              {ORDER_STATUSES.map((status, i) => {
                const isDone = i <= order.statusIndex;
                const isCurrent = i === order.statusIndex;
                return (
                  <div key={status.key} className={styles.timelineStep}>
                    <div className={styles.timelineLeft}>
                      <div className={`${styles.timelineDot} ${isDone ? styles.dotDone : ''} ${isCurrent ? styles.dotCurrent : ''}`}>
                        {isDone ? (isCurrent ? status.icon : '✓') : i + 1}
                      </div>
                      {i < ORDER_STATUSES.length - 1 && (
                        <div className={`${styles.timelineLine} ${i < order.statusIndex ? styles.lineDone : ''}`} />
                      )}
                    </div>
                    <div className={`${styles.timelineContent} ${isCurrent ? styles.timelineContentActive : ''}`}>
                      <h3 className={styles.timelineLabel}>{status.label}</h3>
                      <p className={styles.timelineDesc}>{isDone || isCurrent ? status.desc : 'Pending...'}</p>
                      {isCurrent && (
                        <span className={styles.timelineBadge}>Current Status</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Details */}
            <div className={styles.detailsGrid}>
              <div className={styles.detailCard}>
                <h3 className={styles.detailTitle}>🚚 Delivery Info</h3>
                <p><strong>Estimated Delivery:</strong> {order.estimatedDelivery}</p>
                <p><strong>Shipping To:</strong> {order.address}</p>
              </div>
              <div className={styles.detailCard}>
                <h3 className={styles.detailTitle}>📦 Items Ordered</h3>
                {order.items.map((item, i) => (
                  <div key={i} className={styles.orderItem}>
                    <span>{item.name} × {item.qty}</span>
                    <span>Rs. {(item.price * item.qty).toLocaleString()}</span>
                  </div>
                ))}
                <div className={styles.orderTotal}>
                  <strong>Total: Rs. {(order.total + order.shipping).toLocaleString()}</strong>
                </div>
              </div>
            </div>

            {/* Help */}
            <div className={styles.helpSection}>
              <p>Need help with your order?</p>
              <a
                href={`https://wa.me/94XXXXXXXXX?text=Hi!%20I%20need%20help%20with%20order%20%23${order.orderNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.helpWhatsapp}
              >
                💬 Contact Us on WhatsApp
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
