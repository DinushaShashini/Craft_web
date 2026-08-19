import styles from './AdminTable.module.css';

/**
 * Generic admin table with search, optional filter select, and pagination.
 *
 * Props:
 *  columns   – [{ key, label, render? }]
 *  rows      – filtered data array (already sliced to page)
 *  total     – total rows count (before pagination)
 *  page      – current page (1-indexed)
 *  pageSize  – rows per page
 *  onPage    – (page) => void
 *  search    – string
 *  onSearch  – (value) => void
 *  searchPlaceholder
 *  filters   – [{ key, label, options: [{value, label}], value, onChange }]
 *  actions   – JSX (extra buttons in the toolbar)
 *  emptyText
 */
export default function AdminTable({
  columns = [],
  rows = [],
  total = 0,
  page = 1,
  pageSize = 10,
  onPage,
  search = '',
  onSearch,
  searchPlaceholder = 'Search…',
  filters = [],
  actions,
  emptyText = 'No records found.',
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className={styles.wrapper}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          {onSearch && (
            <div className={styles.searchWrap}>
              <span className={styles.searchIcon}>🔍</span>
              <input
                className={styles.searchInput}
                type="text"
                placeholder={searchPlaceholder}
                value={search}
                onChange={e => onSearch(e.target.value)}
              />
              {search && (
                <button className={styles.clearBtn} onClick={() => onSearch('')}>✕</button>
              )}
            </div>
          )}
          {filters.map(f => (
            <select
              key={f.key}
              className={styles.filterSelect}
              value={f.value}
              onChange={e => f.onChange(e.target.value)}
              aria-label={f.label}
            >
              <option value="">{f.label}: All</option>
              {f.options.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          ))}
        </div>
        {actions && <div className={styles.toolbarRight}>{actions}</div>}
      </div>

      {/* Table */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col.key} className={styles.th}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className={styles.empty}>{emptyText}</td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr key={row.id ?? i} className={styles.tr}>
                  {columns.map(col => (
                    <td key={col.key} className={styles.td}>
                      {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className={styles.pagination}>
        <span className={styles.paginInfo}>
          {total === 0 ? 'No results' : `Showing ${from}–${to} of ${total}`}
        </span>
        <div className={styles.paginBtns}>
          <button
            className={styles.paginBtn}
            disabled={page <= 1}
            onClick={() => onPage(page - 1)}
          >‹ Prev</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
            .reduce((acc, p, idx, arr) => {
              if (idx > 0 && p - arr[idx - 1] > 1) acc.push('…');
              acc.push(p);
              return acc;
            }, [])
            .map((item, idx) =>
              item === '…' ? (
                <span key={`dots-${idx}`} className={styles.paginDots}>…</span>
              ) : (
                <button
                  key={item}
                  className={`${styles.paginBtn} ${item === page ? styles.paginActive : ''}`}
                  onClick={() => onPage(item)}
                >
                  {item}
                </button>
              )
            )}
          <button
            className={styles.paginBtn}
            disabled={page >= totalPages}
            onClick={() => onPage(page + 1)}
          >Next ›</button>
        </div>
      </div>
    </div>
  );
}
