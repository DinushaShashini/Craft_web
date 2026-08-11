import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import { products, categories } from '../data/products';
import styles from './Shop.module.css';

// ─── constants ───────────────────────────────────────────────
const SORT_OPTIONS = [
  { value: 'popular',    label: '🔥 Popular' },
  { value: 'newest',     label: '✨ Newest' },
  { value: 'price-low',  label: '💰 Price: Low → High' },
  { value: 'price-high', label: '💎 Price: High → Low' },
];

const MAX_PRICE = 2000;  // change this if your max product price changes

// ─── helpers ─────────────────────────────────────────────────
function StarRow({ rating }) {
  return (
    <div className={styles.stars} aria-label={`${rating} out of 5`}>
      {[1,2,3,4,5].map(s => (
        <span key={s} className={s <= Math.round(rating) ? styles.starOn : styles.starOff}>★</span>
      ))}
      <span className={styles.ratingNum}>{rating.toFixed(1)}</span>
    </div>
  );
}

function StockBadge({ stock }) {
  if (stock === 0)  return <span className={`${styles.stockBadge} ${styles.stockOut}`}>Out of Stock</span>;
  if (stock <= 5)   return <span className={`${styles.stockBadge} ${styles.stockLow}`}>Only {stock} left</span>;
  return               <span className={`${styles.stockBadge} ${styles.stockIn}`}>In Stock</span>;
}

// ─── ProductCard (Shop-specific, full-featured) ───────────────
function ShopProductCard({ product, wishlist, onWishlist }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const isWished = wishlist.includes(product.id);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock === 0) return;
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onWishlist(product.id);
  };

  return (
    <article className={styles.card}>
      {/* ── Image ── */}
      <div className={styles.imageBox}>
        <img
          src={product.images[0]}
          alt={product.name}
          className={styles.cardImg}
          loading="lazy"
        />

        {/* Hover overlay */}
        <div className={styles.cardOverlay}>
          <Link
            to={`/product/${product.id}`}
            className={styles.quickViewBtn}
            aria-label={`View ${product.name}`}
          >
            👁 View Product
          </Link>
        </div>

        {/* Badges – top-left */}
        <div className={styles.badgeStack}>
          {product.isBestseller && <span className={`${styles.badge} ${styles.badgePop}`}>Popular</span>}
          {product.isNew        && <span className={`${styles.badge} ${styles.badgeNew}`}>New</span>}
          {discount             && <span className={`${styles.badge} ${styles.badgeSale}`}>-{discount}%</span>}
        </div>

        {/* Wishlist – top-right */}
        <button
          className={`${styles.wishBtn} ${isWished ? styles.wishActive : ''}`}
          onClick={handleWishlist}
          aria-label={isWished ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          {isWished ? '♥' : '♡'}
        </button>

        {/* Customizable tag */}
        {product.customizable && (
          <span className={styles.customTag}>✏️ Custom</span>
        )}
      </div>

      {/* ── Content ── */}
      <div className={styles.cardBody}>
        <span className={styles.cardCategory}>{product.category}</span>

        <h3 className={styles.cardName}>
          <Link to={`/product/${product.id}`}>{product.name}</Link>
        </h3>

        <StarRow rating={product.rating} />
        <StockBadge stock={product.stock} />

        <div className={styles.cardFooter}>
          <div className={styles.cardPricing}>
            <span className={styles.cardPrice}>Rs.&nbsp;{product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <span className={styles.cardOriginal}>Rs.&nbsp;{product.originalPrice.toLocaleString()}</span>
            )}
          </div>

          <button
            className={`${styles.addBtn} ${added ? styles.addBtnAdded : ''}`}
            onClick={handleAdd}
            disabled={product.stock === 0}
            aria-label={`Add ${product.name} to cart`}
          >
            {added ? '✓' : '+'}
          </button>
        </div>
      </div>
    </article>
  );
}

// ─── Main Shop page ───────────────────────────────────────────
export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();

  // filter state
  const [localSearch, setLocalSearch]       = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy]                 = useState('popular');
  const [maxPrice, setMaxPrice]             = useState(MAX_PRICE);
  const [quickFilter, setQuickFilter]       = useState('');   // 'isBestseller' | 'isNew' | 'customizable'
  const [showSidebar, setShowSidebar]       = useState(false);

  // wishlist (session only — no backend)
  const [wishlist, setWishlist]             = useState(() => {
    try { return JSON.parse(localStorage.getItem('imocraft-wishlist') || '[]'); } catch { return []; }
  });

  // sync category from URL
  useEffect(() => {
    const cat = searchParams.get('category') || 'all';
    setSelectedCategory(cat);
  }, [searchParams]);

  // persist wishlist
  useEffect(() => {
    localStorage.setItem('imocraft-wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = useCallback((id) => {
    setWishlist(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }, []);

  // close sidebar on ESC
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setShowSidebar(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // derived filtered + sorted list
  const filtered = useMemo(() => {
    let list = [...products];

    // 1. text search
    const q = localSearch.trim().toLowerCase();
    if (q) {
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.tags || []).some(t => t.toLowerCase().includes(q))
      );
    }

    // 2. category
    if (selectedCategory !== 'all') {
      list = list.filter(p => p.category === selectedCategory);
    }

    // 3. price
    list = list.filter(p => p.price <= maxPrice);

    // 4. quick filter
    if (quickFilter) {
      list = list.filter(p => p[quickFilter]);
    }

    // 5. sort
    switch (sortBy) {
      case 'price-low':  list.sort((a, b) => a.price - b.price);  break;
      case 'price-high': list.sort((a, b) => b.price - a.price);  break;
      case 'newest':     list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)); break;
      default:           list.sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0));
    }

    return list;
  }, [localSearch, selectedCategory, maxPrice, quickFilter, sortBy]);

  const handleCategoryChange = (catId) => {
    setSelectedCategory(catId);
    const params = new URLSearchParams(searchParams);
    if (catId === 'all') params.delete('category');
    else { params.set('category', catId); params.delete('search'); }
    setSearchParams(params);
  };

  const clearAll = () => {
    setLocalSearch('');
    setSelectedCategory('all');
    setSortBy('popular');
    setMaxPrice(MAX_PRICE);
    setQuickFilter('');
    setSearchParams({});
  };

  const hasActiveFilters = selectedCategory !== 'all' || localSearch || maxPrice < MAX_PRICE || quickFilter;

  const pageTitle = localSearch
    ? `Results for "${localSearch}"`
    : selectedCategory !== 'all'
      ? categories.find(c => c.id === selectedCategory)?.name || 'Shop'
      : 'Our Collection';

  return (
    <main className={styles.shopPage}>

      {/* ── Page Header ── */}
      <div className={styles.pageHeader}>
        <div className="container">
          <div className={styles.headerRow}>
            <div>
              <span className="section-tag">Handmade in Sri Lanka</span>
              <h1 className={styles.pageTitle}>{pageTitle}</h1>
            </div>

            {/* Inline search bar */}
            <form
              className={styles.headerSearch}
              onSubmit={e => { e.preventDefault(); }}
              role="search"
            >
              <span className={styles.searchIcon}>🔍</span>
              <input
                id="shop-search"
                type="search"
                value={localSearch}
                onChange={e => setLocalSearch(e.target.value)}
                placeholder="Search keychains, pens, frames…"
                className={styles.searchInput}
                aria-label="Search products"
              />
              {localSearch && (
                <button
                  type="button"
                  className={styles.searchClear}
                  onClick={() => setLocalSearch('')}
                  aria-label="Clear search"
                >✕</button>
              )}
            </form>
          </div>

          {/* Sort pills row (mobile-friendly) */}
          <div className={styles.sortPills}>
            {SORT_OPTIONS.map(o => (
              <button
                key={o.value}
                className={`${styles.sortPill} ${sortBy === o.value ? styles.sortPillActive : ''}`}
                onClick={() => setSortBy(o.value)}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container">
        <div className={styles.layout}>

          {/* ── Sidebar ── */}
          <aside
            className={`${styles.sidebar} ${showSidebar ? styles.sidebarOpen : ''}`}
            aria-label="Product filters"
          >
            <div className={styles.sidebarHead}>
              <h2 className={styles.sidebarTitle}>⚙️ Filters</h2>
              {hasActiveFilters && (
                <button className={styles.clearBtn} onClick={clearAll}>Clear all</button>
              )}
            </div>

            {/* Category */}
            <div className={styles.filterBlock}>
              <h3 className={styles.filterHeading}>Category</h3>

              <button
                className={`${styles.catBtn} ${selectedCategory === 'all' ? styles.catActive : ''}`}
                onClick={() => handleCategoryChange('all')}
              >
                <span>🛒 All Products</span>
                <span className={styles.catCount}>{products.length}</span>
              </button>

              {categories.filter(c => c.count > 0).map(cat => (
                <button
                  key={cat.id}
                  className={`${styles.catBtn} ${selectedCategory === cat.id ? styles.catActive : ''}`}
                  onClick={() => handleCategoryChange(cat.id)}
                  style={{ '--ccat': cat.color }}
                >
                  <span>{cat.icon} {cat.name}</span>
                  <span className={styles.catCount}>{cat.count}</span>
                </button>
              ))}
            </div>

            {/* Price range */}
            <div className={styles.filterBlock}>
              <h3 className={styles.filterHeading}>Max Price</h3>
              <div className={styles.priceDisplay}>
                <span>Rs. 0</span>
                <span className={styles.priceMax}>Rs. {maxPrice.toLocaleString()}</span>
              </div>
              <div className={styles.sliderWrap}>
                <input
                  type="range"
                  min={0}
                  max={MAX_PRICE}
                  step={50}
                  value={maxPrice}
                  onChange={e => setMaxPrice(Number(e.target.value))}
                  className={styles.slider}
                  aria-label="Maximum price"
                  style={{ '--pct': `${(maxPrice / MAX_PRICE) * 100}%` }}
                />
              </div>
              <div className={styles.pricePresets}>
                {[500, 1000, 1500, MAX_PRICE].map(p => (
                  <button
                    key={p}
                    className={`${styles.pricePreset} ${maxPrice === p ? styles.pricePresetActive : ''}`}
                    onClick={() => setMaxPrice(p)}
                  >
                    {p === MAX_PRICE ? 'All' : `≤ ${p}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick filters */}
            <div className={styles.filterBlock}>
              <h3 className={styles.filterHeading}>Quick Filters</h3>
              {[
                { key: 'isBestseller', label: '🔥 Bestsellers' },
                { key: 'isNew',        label: '✨ New Arrivals' },
                { key: 'customizable', label: '✏️ Customizable' },
              ].map(f => (
                <button
                  key={f.key}
                  className={`${styles.quickBtn} ${quickFilter === f.key ? styles.quickBtnActive : ''}`}
                  onClick={() => setQuickFilter(prev => prev === f.key ? '' : f.key)}
                >
                  {f.label}
                  {quickFilter === f.key && <span className={styles.quickCheck}>✓</span>}
                </button>
              ))}
            </div>

            {/* Wishlist shortcut */}
            {wishlist.length > 0 && (
              <div className={styles.filterBlock}>
                <h3 className={styles.filterHeading}>♥ My Wishlist</h3>
                <p className={styles.wishlistNote}>{wishlist.length} item{wishlist.length !== 1 ? 's' : ''} saved</p>
              </div>
            )}
          </aside>

          {/* Sidebar backdrop (mobile) */}
          {showSidebar && (
            <div
              className={styles.backdrop}
              onClick={() => setShowSidebar(false)}
              aria-hidden="true"
            />
          )}

          {/* ── Products Area ── */}
          <section className={styles.productsArea} aria-label="Product list">

            {/* Toolbar */}
            <div className={styles.toolbar}>
              <button
                className={styles.filterToggle}
                onClick={() => setShowSidebar(s => !s)}
                aria-expanded={showSidebar}
                aria-controls="shop-sidebar"
              >
                <span>⚙️</span> Filters
                {hasActiveFilters && <span className={styles.filterDot} />}
              </button>

              <p className={styles.resultCount}>
                <strong>{filtered.length}</strong> {filtered.length === 1 ? 'product' : 'products'} found
              </p>

              {/* Active filter chips */}
              <div className={styles.chips}>
                {selectedCategory !== 'all' && (
                  <span className={styles.chip}>
                    {categories.find(c => c.id === selectedCategory)?.name}
                    <button onClick={() => handleCategoryChange('all')} aria-label="Remove category filter">✕</button>
                  </span>
                )}
                {localSearch && (
                  <span className={styles.chip}>
                    "{localSearch}"
                    <button onClick={() => setLocalSearch('')} aria-label="Clear search">✕</button>
                  </span>
                )}
                {maxPrice < MAX_PRICE && (
                  <span className={styles.chip}>
                    ≤ Rs.{maxPrice}
                    <button onClick={() => setMaxPrice(MAX_PRICE)} aria-label="Remove price filter">✕</button>
                  </span>
                )}
                {quickFilter && (
                  <span className={styles.chip}>
                    {quickFilter === 'isBestseller' ? 'Bestsellers' : quickFilter === 'isNew' ? 'New' : 'Customizable'}
                    <button onClick={() => setQuickFilter('')} aria-label="Remove quick filter">✕</button>
                  </span>
                )}
              </div>
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
              <EmptyState
                icon="🎨"
                title="No products found"
                subtitle="Try adjusting your filters or search term."
                actionLabel="Clear Filters"
                onAction={clearAll}
              />
            ) : (
              <div className={styles.grid}>
                {filtered.map(product => (
                  <ShopProductCard
                    key={product.id}
                    product={product}
                    wishlist={wishlist}
                    onWishlist={toggleWishlist}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
