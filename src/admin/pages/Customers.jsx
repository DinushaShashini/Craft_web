import { useState, useMemo } from 'react';
import { useAdmin } from '../../context/AdminContext';
import PageHeader from '../components/PageHeader';
import AdminTable from '../components/AdminTable';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import styles from './Customers.module.css';

const PAGE_SIZE = 8;
function fmt(n) { return 'Rs. ' + Number(n).toLocaleString('en-LK'); }

export default function Customers() {
  const { customers, orders } = useAdmin();
  const [search, setSearch]     = useState('');
  const [statusFilter, setStatus] = useState('');
  const [page, setPage]         = useState(1);
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return customers.filter(c =>
      (!q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)) &&
      (!statusFilter || c.status === statusFilter)
    );
  }, [customers, search, statusFilter]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const customerOrders = (custId) => orders.filter(o => o.customer.id === custId);

  const columns = [
    {
      key: 'name', label: 'Customer',
      render: (name, c) => (
        <div>
          <div className={styles.custName}>{name}</div>
          <div className={styles.custEmail}>{c.email}</div>
        </div>
      ),
    },
    { key: 'phone', label: 'Phone' },
    { key: 'orders', label: 'Orders', render: n => <span className={styles.countBadge}>{n}</span> },
    { key: 'totalSpent', label: 'Total Spent', render: v => <strong>{fmt(v)}</strong> },
    { key: 'joinedAt', label: 'Joined', render: v => new Date(v).toLocaleDateString('en-GB') },
    { key: 'status', label: 'Status', render: v => <Badge label={v} /> },
    {
      key: 'id', label: 'Actions',
      render: (_, c) => (
        <button className={styles.btnView} onClick={() => setSelected(c)}>View Orders</button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Customers" subtitle={`${customers.length} registered customers`} />

      <AdminTable
        columns={columns}
        rows={paged}
        total={filtered.length}
        page={page}
        pageSize={PAGE_SIZE}
        onPage={setPage}
        search={search}
        onSearch={v => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search by name or email…"
        filters={[{
          key: 'status', label: 'Status', value: statusFilter,
          options: [{ value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }],
          onChange: v => { setStatus(v); setPage(1); },
        }]}
      />

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={`Orders – ${selected?.name}`} size="lg">
        {selected && (
          <div>
            <div className={styles.custDetailRow}>
              <div><span className={styles.detailLabel}>Email:</span> {selected.email}</div>
              <div><span className={styles.detailLabel}>Phone:</span> {selected.phone}</div>
              <div><span className={styles.detailLabel}>Orders:</span> {selected.orders}</div>
              <div><span className={styles.detailLabel}>Total Spent:</span> <strong>{fmt(selected.totalSpent)}</strong></div>
              <div><span className={styles.detailLabel}>Joined:</span> {new Date(selected.joinedAt).toLocaleDateString('en-GB')}</div>
            </div>
            <h4 className={styles.orderHeading}>Order History</h4>
            {customerOrders(selected.id).length === 0 ? (
              <p className={styles.noOrders}>No orders yet.</p>
            ) : (
              <table className={styles.ordTable}>
                <thead>
                  <tr>{['Order #', 'Total', 'Status', 'Date'].map(h => <th key={h} className={styles.th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {customerOrders(selected.id).map(o => (
                    <tr key={o.id} className={styles.tr}>
                      <td className={styles.td}><span className={styles.orderNum}>{o.orderNumber}</span></td>
                      <td className={styles.td}><strong>{fmt(o.total)}</strong></td>
                      <td className={styles.td}><Badge label={o.orderStatus} /></td>
                      <td className={styles.td}>{new Date(o.createdAt).toLocaleDateString('en-GB')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
