import { useState, useMemo } from 'react';
import { useAdmin } from '../../context/AdminContext';
import PageHeader from '../components/PageHeader';
import AdminTable from '../components/AdminTable';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import styles from './Delivery.module.css';

const PAGE_SIZE = 8;
const DELIVERY_STATUSES = ['Pending', 'In Transit', 'Delivered', 'Cancelled'];

export default function Delivery() {
  const { deliveries, updateDelivery } = useAdmin();
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatus]     = useState('');
  const [page, setPage]               = useState(1);
  const [selected, setSelected]       = useState(null);
  const [editForm, setEditForm]       = useState({});

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return deliveries.filter(d =>
      (!q || d.orderNumber.toLowerCase().includes(q) || d.customer.toLowerCase().includes(q)) &&
      (!statusFilter || d.status === statusFilter)
    );
  }, [deliveries, search, statusFilter]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function openEdit(d) {
    setSelected(d);
    setEditForm({ courier: d.courier, trackingNumber: d.trackingNumber || '', status: d.status, estimatedDate: d.estimatedDate || '', deliveredDate: d.deliveredDate || '' });
  }

  function handleSave(e) {
    e.preventDefault();
    updateDelivery(selected.id, editForm);
    setSelected(null);
  }

  const columns = [
    { key: 'orderNumber', label: 'Order #', render: n => <span className={styles.orderNum}>{n}</span> },
    { key: 'customer', label: 'Customer', render: n => <strong>{n}</strong> },
    { key: 'address', label: 'Address', render: v => <span className={styles.address}>{v}</span> },
    { key: 'courier', label: 'Courier' },
    { key: 'trackingNumber', label: 'Tracking #', render: v => v || <span className={styles.na}>N/A</span> },
    { key: 'status', label: 'Status', render: v => <Badge label={v} /> },
    { key: 'estimatedDate', label: 'Est. Date', render: v => v ? new Date(v).toLocaleDateString('en-GB') : '—' },
    {
      key: 'id', label: 'Actions',
      render: (_, d) => (
        <button className={styles.btnEdit} onClick={() => openEdit(d)}>Update</button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Delivery" subtitle={`${deliveries.length} shipments`} />

      <AdminTable
        columns={columns}
        rows={paged}
        total={filtered.length}
        page={page}
        pageSize={PAGE_SIZE}
        onPage={setPage}
        search={search}
        onSearch={v => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search by order # or customer…"
        filters={[{
          key: 'status', label: 'Status', value: statusFilter,
          options: DELIVERY_STATUSES.map(s => ({ value: s, label: s })),
          onChange: v => { setStatus(v); setPage(1); },
        }]}
      />

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Update Delivery" size="sm">
        {selected && (
          <form onSubmit={handleSave} className={styles.form}>
            <p className={styles.meta}>Order: <strong>{selected.orderNumber}</strong> · {selected.customer}</p>
            <label className={styles.label}>Courier</label>
            <input className={styles.input} value={editForm.courier}
              onChange={e => setEditForm(f => ({ ...f, courier: e.target.value }))} />
            <label className={styles.label}>Tracking Number</label>
            <input className={styles.input} value={editForm.trackingNumber}
              onChange={e => setEditForm(f => ({ ...f, trackingNumber: e.target.value }))} />
            <label className={styles.label}>Delivery Status</label>
            <select className={styles.input} value={editForm.status}
              onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}>
              {DELIVERY_STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
            <label className={styles.label}>Estimated Delivery Date</label>
            <input type="date" className={styles.input} value={editForm.estimatedDate}
              onChange={e => setEditForm(f => ({ ...f, estimatedDate: e.target.value }))} />
            <label className={styles.label}>Delivered Date</label>
            <input type="date" className={styles.input} value={editForm.deliveredDate}
              onChange={e => setEditForm(f => ({ ...f, deliveredDate: e.target.value }))} />
            <div className={styles.actions}>
              <button type="button" className={styles.btnCancel} onClick={() => setSelected(null)}>Cancel</button>
              <button type="submit" className={styles.btnSave}>Save</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
