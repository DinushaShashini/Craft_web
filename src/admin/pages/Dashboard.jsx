import { useAdmin } from '../../context/AdminContext';
import { monthlySales, topProducts } from '../../data/adminData';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import styles from './Dashboard.module.css';

function fmt(n) {
  return 'Rs. ' + Number(n).toLocaleString('en-LK');
}

export default function Dashboard() {
  const { stats, orders } = useAdmin();

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6);

  const maxRevenue = Math.max(...monthlySales.map(m => m.revenue));

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back — here's what's happening with IMO Craft today."
      />

      {/* Stat grid */}
      <div className={styles.statGrid}>
        <StatCard label="Total Orders"      value={stats.totalOrders}      icon="🛒" color="blue"   />
        <StatCard label="Total Sales"       value={fmt(stats.totalSales)}  icon="💰" color="gold"   />
        <StatCard label="Pending Orders"    value={stats.pendingOrders}    icon="⏳" color="orange" />
        <StatCard label="Completed Orders"  value={stats.completedOrders}  icon="✅" color="sage"   />
        <StatCard label="Total Products"    value={stats.totalProducts}    icon="📦" color="rose"   />
        <StatCard label="Low Stock"         value={stats.lowStockProducts} icon="⚠️" color="red"    sub={stats.lowStockProducts > 0 ? 'Needs attention' : 'All good'} />
      </div>

      <div className={styles.row}>
        {/* Monthly revenue bar chart */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Monthly Revenue</h3>
          <div className={styles.barChart}>
            {monthlySales.map(m => (
              <div key={m.month} className={styles.barGroup}>
                <div className={styles.barWrap}>
                  <div
                    className={styles.bar}
                    style={{ height: `${(m.revenue / maxRevenue) * 160}px` }}
                    title={fmt(m.revenue)}
                  />
                </div>
                <div className={styles.barLabel}>{m.month}</div>
                <div className={styles.barVal}>{(m.revenue / 1000).toFixed(0)}k</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top products */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Top Products</h3>
          <div className={styles.topList}>
            {topProducts.map((p, i) => (
              <div key={p.name} className={styles.topItem}>
                <span className={styles.topRank}>{i + 1}</span>
                <div className={styles.topInfo}>
                  <div className={styles.topName}>{p.name}</div>
                  <div className={styles.topMeta}>{p.sales} sales</div>
                </div>
                <div className={styles.topRevenue}>{fmt(p.revenue)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className={styles.card} style={{ marginTop: '1.5rem' }}>
        <h3 className={styles.cardTitle}>Recent Orders</h3>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                {['Order #', 'Customer', 'Total', 'Payment', 'Status', 'Date'].map(h => (
                  <th key={h} className={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(o => (
                <tr key={o.id} className={styles.tr}>
                  <td className={styles.td}><span className={styles.orderNum}>{o.orderNumber}</span></td>
                  <td className={styles.td}>{o.customer.name}</td>
                  <td className={styles.td}><strong>{fmt(o.total)}</strong></td>
                  <td className={styles.td}><Badge label={o.paymentStatus} /></td>
                  <td className={styles.td}><Badge label={o.orderStatus} /></td>
                  <td className={styles.td}>{new Date(o.createdAt).toLocaleDateString('en-GB')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
