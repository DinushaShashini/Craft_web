import { useState, useMemo } from 'react';
import { useAdmin } from '../../context/AdminContext';
import PageHeader from '../components/PageHeader';
import AdminTable from '../components/AdminTable';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import styles from './Orders.module.css';

const PAGE_SIZE = 8;
function fmt(n) { return 'Rs. ' + Number(n).toLocaleString('en-LK'); }

const ORDER_STATUSES   = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const DELIVERY_STATUSES = ['Pending', 'In Transit', 'Delivered', 'Cancelled'];
const PAYMENT_STATUSES  = ['Pending', 'Paid', 'Refunded'];

export default function Orders() {
  const { orders, updateOrderStatus, updateDeliveryStatus, updatePaymentStatus } = useAdmin();

  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [payFilter, setPayFilter]       = useState('');
  const [page, setPage]               = useState(1);
  const [selected, setSelected]       = useState(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return orders.filter(o => {
      const matchSearch = !q
        || o.orderNumber.toLowerCase().includes(q)
        || o.customer.name.toLowerCase().includes(q)
        || o.customer.email.toLowerCase().includes(q);
      const matchStatus = !statusFilter || o.orderStatus === statusFilter;
      const matchPay    = !payFilter    || o.paymentStatus === payFilter;
      return matchSearch && matchStatus && matchPay;
    });
  }, [orders, search, statusFilter, payFilter]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const columns = [
    {
      key: 'orderNumber', label: 'Order #',
      render: n => <span className={styles.orderNum}>{n}</span>,
    },
    {
      key: 'customer', label: 'Customer',
      render: c => (
        <div>
          <div className={styles.custName}>{c.name}</div>
          <div className={styles.custEmail}>{c.email}</div>
        </div>
      ),
    },
    {
      key: 'products', label: 'Items',
      render: prods => (
        <div className={styles.itemsList}>
          {prods.map(p => (
            <div key={p.id} className={styles.itemLine}>
              {p.name} ×{p.qty}
            </div>
          ))}
        </div>
      ),
    },
    {
      key: 'total', label: 'Total',
      render: v => <strong>{fmt(v)}</strong>,
    },
    {
      key: 'paymentStatus', label: 'Payment',
      render: v => <Badge label={v} />,
    },
    {
      key: 'orderStatus', label: 'Status',
      render: v => <Badge label={v} />,
    },
    {
      key: 'createdAt', label: 'Date',
      render: v => new Date(v).toLocaleDateString('en-GB'),
    },
    {
      key: 'id', label: 'Actions',
      render: (_, o) => (
        <button className={styles.btnView} onClick={() => setSelected(o)}>View</button>
      ),
    },
  ];

  function handleOrderStatus(e) {
    updateOrderStatus(selected.id, e.target.value);
    setSelected(prev => ({ ...prev, orderStatus: e.target.value }));
  }

  function handleDeliveryStatus(e) {
    updateDeliveryStatus(selected.id, e.target.value);
    setSelected(prev => ({ ...prev, deliveryStatus: e.target.value }));
  }

  function handlePaymentStatus(e) {
    updatePaymentStatus(selected.id, e.target.value);
    setSelected(prev => ({ ...prev, paymentStatus: e.target.value }));
  }

  return (
    <div>
      <PageHeader
        title="Orders"
        subtitle={`${orders.length} total orders`}
      />

      <AdminTable
        columns={columns}
        rows={paged}
        total={filtered.length}
        page={page}
        pageSize={PAGE_SIZE}
        onPage={p => setPage(p)}
        search={search}
        onSearch={v => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search by order #, customer…"
        filters={[
          {
            key: 'status', label: 'Order Status', value: statusFilter,
            options: ORDER_STATUSES.map(s => ({ value: s, label: s })),
            onChange: v => { setStatusFilter(v); setPage(1); },
          },
          {
            key: 'pay', label: 'Payment', value: payFilter,
            options: PAYMENT_STATUSES.map(s => ({ value: s, label: s })),
            onChange: v => { setPayFilter(v); setPage(1); },
          },
        ]}
      />

      {/* Order detail modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={`Order – ${selected?.orderNumber}`} size="xl">
        {selected && (
          <div className={styles.detail}>
            {/* Row 1: customer + payment */}
            <div className={styles.detailGrid}>
              <section className={styles.section}>
                <h4 className={styles.sectionTitle}>Customer</h4>
                <p><strong>{selected.customer.name}</strong></p>
                <p>{selected.customer.email}</p>
                <p>{selected.customer.phone}</p>
                <p className={styles.address}>{selected.address}</p>
                {selected.notes && <p className={styles.notes}>Note: {selected.notes}</p>}
              </section>

              <section className={styles.section}>
                <h4 className={styles.sectionTitle}>Payment</h4>
                <p>Method: <strong>{selected.paymentMethod}</strong></p>
                <p>Subtotal: {fmt(selected.subtotal)}</p>
                {selected.discount > 0 && <p>Discount: -{fmt(selected.discount)}</p>}
                <p>Shipping: {selected.shipping > 0 ? fmt(selected.shipping) : 'Free'}</p>
                <p className={styles.totalLine}>Total: <strong>{fmt(selected.total)}</strong></p>
              </section>
            </div>

            {/* Row 2: products */}
            <section className={styles.section}>
              <h4 className={styles.sectionTitle}>Products</h4>
              <div className={styles.prodList}>
                {selected.products.map(p => (
                  <div key={p.id} className={styles.prodRow}>
                    <img src={p.image} alt={p.name} className={styles.prodThumb}
                      onError={e => { e.target.src = 'https://placehold.co/48x48?text=Img'; }} />
                    <div className={styles.prodInfo}>
                      <div className={styles.prodName}>{p.name}</div>
                      <div className={styles.prodMeta}>Qty: {p.qty} × {fmt(p.price)}</div>
                    </div>
                    <div className={styles.prodTotal}>{fmt(p.qty * p.price)}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Row 3: status controls */}
            <div className={styles.statusGrid}>
              <div className={styles.statusGroup}>
                <label className={styles.statusLabel}>Order Status</label>
                <select className={styles.statusSelect} value={selected.orderStatus} onChange={handleOrderStatus}>
                  {ORDER_STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className={styles.statusGroup}>
                <label className={styles.statusLabel}>Delivery Status</label>
                <select className={styles.statusSelect} value={selected.deliveryStatus} onChange={handleDeliveryStatus}>
                  {DELIVERY_STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className={styles.statusGroup}>
                <label className={styles.statusLabel}>Payment Status</label>
                <select className={styles.statusSelect} value={selected.paymentStatus} onChange={handlePaymentStatus}>
                  {PAYMENT_STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {selected.trackingNumber && (
              <p className={styles.tracking}>Tracking: <strong>{selected.trackingNumber}</strong></p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
