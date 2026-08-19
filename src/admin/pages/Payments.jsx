import { useState, useMemo } from 'react';
import { useAdmin } from '../../context/AdminContext';
import PageHeader from '../components/PageHeader';
import AdminTable from '../components/AdminTable';
import Badge from '../components/Badge';
import styles from './Payments.module.css';

const PAGE_SIZE = 8;
function fmt(n) { return 'Rs. ' + Number(n).toLocaleString('en-LK'); }

export default function Payments() {
  const { payments } = useAdmin();
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatus]   = useState('');
  const [methodFilter, setMethod]   = useState('');
  const [page, setPage]             = useState(1);

  const totalRevenue = payments
    .filter(p => p.status === 'Completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return payments.filter(p =>
      (!q || p.orderNumber.toLowerCase().includes(q) || p.customer.toLowerCase().includes(q)) &&
      (!statusFilter || p.status === statusFilter) &&
      (!methodFilter || p.method === methodFilter)
    );
  }, [payments, search, statusFilter, methodFilter]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const columns = [
    { key: 'id', label: 'Payment ID', render: v => <span className={styles.payId}>{v}</span> },
    { key: 'orderNumber', label: 'Order #', render: n => <span className={styles.orderNum}>{n}</span> },
    { key: 'customer', label: 'Customer', render: n => <strong>{n}</strong> },
    { key: 'method', label: 'Method' },
    { key: 'amount', label: 'Amount', render: v => <strong className={styles.amount}>{fmt(v)}</strong> },
    { key: 'status', label: 'Status', render: v => <Badge label={v} /> },
    {
      key: 'transactionId', label: 'Transaction ID',
      render: v => v ? <span className={styles.txnId}>{v}</span> : <span className={styles.na}>N/A</span>,
    },
    { key: 'date', label: 'Date', render: v => new Date(v).toLocaleDateString('en-GB') },
  ];

  return (
    <div>
      <PageHeader
        title="Payments"
        subtitle={`Total collected: ${fmt(totalRevenue)}`}
      />

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
        filters={[
          {
            key: 'status', label: 'Status', value: statusFilter,
            options: ['Completed', 'Pending', 'Cancelled'].map(s => ({ value: s, label: s })),
            onChange: v => { setStatus(v); setPage(1); },
          },
          {
            key: 'method', label: 'Method', value: methodFilter,
            options: ['Card', 'Bank Transfer', 'Cash on Delivery'].map(s => ({ value: s, label: s })),
            onChange: v => { setMethod(v); setPage(1); },
          },
        ]}
      />
    </div>
  );
}
