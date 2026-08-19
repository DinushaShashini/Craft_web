import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import styles from './AdminLayout.module.css';

const NAV_ITEMS = [
  { path: '/admin', label: 'Dashboard', icon: '▦', end: true },
  { path: '/admin/products', label: 'Products', icon: '📦' },
  { path: '/admin/categories', label: 'Categories', icon: '🗂️' },
  { path: '/admin/orders', label: 'Orders', icon: '🛒' },
  { path: '/admin/customers', label: 'Customers', icon: '👥' },
  { path: '/admin/reviews', label: 'Reviews', icon: '⭐' },
  { path: '/admin/delivery', label: 'Delivery', icon: '🚚' },
  { path: '/admin/payments', label: 'Payments', icon: '💳' },
  { path: '/admin/reports', label: 'Reports', icon: '📊' },
  { path: '/admin/settings', label: 'Settings', icon: '⚙️' },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className={styles.shell}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className={styles.mobileOverlay} onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''} ${mobileOpen ? styles.mobileVisible : ''}`}>
        <div className={styles.sidebarHeader}>
          {!collapsed && (
            <div className={styles.brand}>
              <span className={styles.brandScript}>IMO</span>
              <span className={styles.brandSub}>Admin</span>
            </div>
          )}
          <button
            className={styles.collapseBtn}
            onClick={() => setCollapsed(c => !c)}
            aria-label="Toggle sidebar"
          >
            {collapsed ? '›' : '‹'}
          </button>
        </div>

        <nav className={styles.nav}>
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.navActive : ''}`
              }
              onClick={() => setMobileOpen(false)}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <button
            className={styles.backBtn}
            onClick={() => navigate('/')}
          >
            <span className={styles.navIcon}>←</span>
            {!collapsed && <span>Back to Store</span>}
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className={styles.main}>
        {/* Topbar */}
        <header className={styles.topbar}>
          <button
            className={styles.hamburger}
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Open menu"
          >
            ☰
          </button>
          <div className={styles.topbarTitle}>IMO Craft &mdash; Admin Panel</div>
          <div className={styles.topbarActions}>
            <button className={styles.notifBtn} aria-label="Notifications">🔔</button>
            <div className={styles.avatar}>A</div>
          </div>
        </header>

        {/* Page content */}
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
