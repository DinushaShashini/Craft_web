import { useState, useMemo } from 'react';
import { useAdmin } from '../../context/AdminContext';
import PageHeader from '../components/PageHeader';
import AdminTable from '../components/AdminTable';
import Badge from '../components/Badge';
import styles from './Reviews.module.css';

const PAGE_SIZE = 8;

function Stars({ rating }) {
  return (
    <span className={styles.stars}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < rating ? styles.starFilled : styles.starEmpty}>★</span>
      ))}
    </span>
  );
}

export default function Reviews() {
  const { reviews, updateReviewStatus, deleteReview } = useAdmin();
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatus]   = useState('');
  const [ratingFilter, setRating]   = useState('');
  const [page, setPage]             = useState(1);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return reviews.filter(r =>
      (!q || r.customer.toLowerCase().includes(q) || r.product.toLowerCase().includes(q)) &&
      (!statusFilter || r.status === statusFilter) &&
      (!ratingFilter || r.rating === Number(ratingFilter))
    );
  }, [reviews, search, statusFilter, ratingFilter]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const columns = [
    { key: 'customer', label: 'Customer', render: n => <strong className={styles.name}>{n}</strong> },
    { key: 'product',  label: 'Product',  render: n => <span className={styles.prodName}>{n}</span> },
    { key: 'rating',   label: 'Rating',   render: v => <Stars rating={v} /> },
    { key: 'comment',  label: 'Comment',  render: v => <span className={styles.comment}>{v}</span> },
    { key: 'date',     label: 'Date',     render: v => new Date(v).toLocaleDateString('en-GB') },
    { key: 'status',   label: 'Status',   render: v => <Badge label={v} /> },
    {
      key: 'id', label: 'Actions',
      render: (_, r) => (
        <div className={styles.actions}>
          {r.status === 'Pending' && (
            <button className={styles.btnPublish} onClick={() => updateReviewStatus(r.id, 'Published')}>
              Publish
            </button>
          )}
          {r.status === 'Published' && (
            <button className={styles.btnUnpublish} onClick={() => updateReviewStatus(r.id, 'Pending')}>
              Unpublish
            </button>
          )}
          <button className={styles.btnDelete} onClick={() => deleteReview(r.id)}>Delete</button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Reviews"
        subtitle={`${reviews.length} reviews · ${reviews.filter(r => r.status === 'Pending').length} pending`}
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
        searchPlaceholder="Search by customer or product…"
        filters={[
          {
            key: 'status', label: 'Status', value: statusFilter,
            options: [{ value: 'Published', label: 'Published' }, { value: 'Pending', label: 'Pending' }],
            onChange: v => { setStatus(v); setPage(1); },
          },
          {
            key: 'rating', label: 'Rating', value: ratingFilter,
            options: [5,4,3,2,1].map(n => ({ value: String(n), label: `${n} Stars` })),
            onChange: v => { setRating(v); setPage(1); },
          },
        ]}
      />
    </div>
  );
}
