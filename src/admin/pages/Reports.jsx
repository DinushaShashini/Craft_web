import { useAdmin } from '../../context/AdminContext';
import { monthlySales, topProducts } from '../../data/adminData';
import PageHeader from '../components/PageHeader';
import styles from './Reports.module.css';

function fmt(n) { return 'Rs. ' + Number(n).toLocaleString('en-LK'); }

const maxRevenue = Math.max(...monthlySales.map(m => m.revenue));
const maxSales   = Math.max(...topProducts.map(p => p.sales));

export default function Reports() {
  const { stats, orders, payments } = useAdmin();

  const byStatus = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => ({
    label: s,
    count: orders.filter(o => o.orderStatus === s).length,
  }));

  const byMethod = ['Card', 'Bank Transfer', 'Cash on Delivery'].map(m => ({
    label: m,
    count: payments.filter(p => p.method === m).length,
    total: payments.filter(p => p.method === m && p.status === 'Completed').reduce((s, p) => s + p.amount, 0),
  }));

  return (
    <div>
      <PageHeader title="Reports" subtitle="Sales overview and key metrics" />

      {/* Summary cards */}
      <div className={styles.summaryGrid}>
        <div className={styles.summCard}>
          <div className={styles.summVal}>{fmt(stats.totalSales)}</div>
          <div className={styles.summLabel}>Total Revenue</div>
        </div>
        <div className={styles.summCard}>
          <div className={styles.summVal}>{stats.totalOrders}</div>
          <div className={styles.summLabel}>Total Orders</div>
        </div>
        <div className={styles.summCard}>
          <div className={styles.summVal}>{stats.completedOrders}</div>
          <div className={styles.summLabel}>Delivered Orders</div>
        </div>
        <div className={styles.summCard}>
          <div className={styles.summVal}>{stats.cancelledOrders}</div>
          <div className={styles.summLabel}>Cancelled Orders</div>
        </div>
      </div>

      <div className={styles.row}>
        {/* Monthly Revenue Chart */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Monthly Revenue (Rs.)</h3>
          <div className={styles.barChart}>
            {monthlySales.map(m => (
              <div key={m.month} className={styles.barGroup}>
                <div className={styles.barLabel2}>{(m.revenue / 1000).toFixed(1)}k</div>
                <div className={styles.barWrap}>
                  <div className={styles.bar} style={{ height: `${(m.revenue / maxRevenue) * 180}px` }} title={fmt(m.revenue)} />
                </div>
                <div className={styles.barMonth}>{m.month}</div>
                <div className={styles.barOrders}>{m.orders} orders</div>
              </div>
            ))}
          </div>
        </div>

        {/* Orders by status */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Orders by Status</h3>
          <div className={styles.statList}>
            {byStatus.map(s => (
              <div key={s.label} className={styles.statRow}>
                <span className={styles.statLabel}>{s.label}</span>
                <div className={styles.statBar}>
                  <div className={styles.statFill} style={{ width: `${stats.totalOrders ? (s.count / stats.totalOrders) * 100 : 0}%` }} />
                </div>
                <span className={styles.statCount}>{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.row} style={{ marginTop: '1.5rem' }}>
        {/* Top products */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Top Products by Sales</h3>
          <div className={styles.barChartH}>
            {topProducts.map(p => (
              <div key={p.name} className={styles.barH}>
                <div className={styles.barHLabel}>{p.name}</div>
                <div className={styles.barHWrap}>
                  <div className={styles.barHFill} style={{ width: `${(p.sales / maxSales) * 100}%` }} />
                </div>
                <span className={styles.barHVal}>{p.sales}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment methods */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Payment Methods</h3>
          <div className={styles.methodList}>
            {byMethod.map(m => (
              <div key={m.label} className={styles.methodRow}>
                <div className={styles.methodInfo}>
                  <span className={styles.methodLabel}>{m.label}</span>
                  <span className={styles.methodCount}>{m.count} transactions</span>
                </div>
                <span className={styles.methodTotal}>{fmt(m.total)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
