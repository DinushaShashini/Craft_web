import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductGrid from '../components/product/ProductGrid';
import Button from '../components/ui/Button';
import { products, categories } from '../data/products';
import styles from './Shop.module.css';

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'newest', label: 'Newest' },
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState([0, 3000]);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    const cat = searchParams.get('category') || 'all';
    setSelectedCategory(cat);
  }, [searchParams]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some(t => t.includes(q)) ||
        p.category.includes(q)
      );
    }

    // Category
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Price
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Sort
    switch (sortBy) {
      case 'price-low': result.sort((a, b) => a.price - b.price); break;
      case 'price-high': result.sort((a, b) => b.price - a.price); break;
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
      case 'newest': result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)); break;
      default: result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    return result;
  }, [selectedCategory, sortBy, priceRange, searchQuery]);

  const handleCategoryChange = (catId) => {
    setSelectedCategory(catId);
    const params = new URLSearchParams(searchParams);
    if (catId === 'all') params.delete('category');
    else params.set('category', catId);
    params.delete('search');
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setSortBy('featured');
    setPriceRange([0, 3000]);
    setSearchParams({});
  };

  return (
    <main>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className="container">
          <span className="section-tag">All Products</span>
          <h1 className={styles.pageTitle}>
            {searchQuery ? `Search: "${searchQuery}"` : selectedCategory !== 'all'
              ? categories.find(c => c.id === selectedCategory)?.name || 'Shop'
              : 'Our Collection'}
          </h1>
          <p className={styles.pageSubtitle}>
            {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
          </p>
        </div>
      </div>

      <div className="container">
        <div className={styles.layout}>
          {/* Sidebar */}
          <aside className={`${styles.sidebar} ${showFilters ? styles.sidebarOpen : ''}`}>
            <div className={styles.sidebarHeader}>
              <h2 className={styles.sidebarTitle}>Filters</h2>
              <button onClick={clearFilters} className={styles.clearBtn}>Clear All</button>
            </div>

            {/* Category Filter */}
            <div className={styles.filterGroup}>
              <h3 className={styles.filterLabel}>Category</h3>
              <button
                className={`${styles.catBtn} ${selectedCategory === 'all' ? styles.catBtnActive : ''}`}
                onClick={() => handleCategoryChange('all')}
              >
                All Products
                <span className={styles.catCount}>{products.length}</span>
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={`${styles.catBtn} ${selectedCategory === cat.id ? styles.catBtnActive : ''}`}
                  onClick={() => handleCategoryChange(cat.id)}
                  style={{ '--cat-c': cat.color }}
                >
                  {cat.icon} {cat.name}
                  <span className={styles.catCount}>{cat.count}</span>
                </button>
              ))}
            </div>

            {/* Price Filter */}
            <div className={styles.filterGroup}>
              <h3 className={styles.filterLabel}>Price Range</h3>
              <div className={styles.priceLabels}>
                <span>Rs. {priceRange[0].toLocaleString()}</span>
                <span>Rs. {priceRange[1].toLocaleString()}</span>
              </div>
              <input
                type="range"
                min={0}
                max={3000}
                step={100}
                value={priceRange[1]}
                onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
                className={styles.rangeInput}
                aria-label="Maximum price"
              />
            </div>

            {/* Quick Filters */}
            <div className={styles.filterGroup}>
              <h3 className={styles.filterLabel}>Quick Filters</h3>
              <div className={styles.quickFilters}>
                {[
                  { label: '⭐ Bestsellers', key: 'isBestseller' },
                  { label: '✨ New Arrivals', key: 'isNew' },
                  { label: '✏️ Customizable', key: 'customizable' },
                ].map(f => (
                  <button key={f.key} className={styles.quickFilter}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Products Area */}
          <div className={styles.productsArea}>
            {/* Toolbar */}
            <div className={styles.toolbar}>
              <button
                className={styles.filterToggle}
                onClick={() => setShowFilters(s => !s)}
              >
                ⚙️ Filters
              </button>
              <div className={styles.sortWrapper}>
                <label htmlFor="sort-select" className={styles.sortLabel}>Sort by:</label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className={styles.sortSelect}
                >
                  {sortOptions.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Filters */}
            {(selectedCategory !== 'all' || searchQuery) && (
              <div className={styles.activeFilters}>
                {selectedCategory !== 'all' && (
                  <span className={styles.activeFilter}>
                    {categories.find(c => c.id === selectedCategory)?.name}
                    <button onClick={() => handleCategoryChange('all')}>✕</button>
                  </span>
                )}
                {searchQuery && (
                  <span className={styles.activeFilter}>
                    Search: {searchQuery}
                    <button onClick={() => setSearchParams({})}>✕</button>
                  </span>
                )}
              </div>
            )}

            <ProductGrid products={filteredProducts} loading={loading} columns={3} />
          </div>
        </div>
      </div>
    </main>
  );
}
