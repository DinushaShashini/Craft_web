import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import styles from './Navbar.module.css';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

const categories = [
  { id: 'keychains', label: '🗝️ Keychains' },
  { id: 'accessories', label: '💎 Accessories' },
  { id: 'gifts', label: '🎁 Gifts' },
  { id: 'bouquets', label: '💐 Craft Bouquets' },
  { id: 'decor', label: '🏡 Home Decor' },
];

export default function Navbar() {
  const { cartCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
    setIsCatOpen(false);
  }, [location.pathname]);

  // Focus search input when opened
  useEffect(() => {
    if (isSearchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  return (
    <>
      <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
        <div className={`container ${styles.inner}`}>

          {/* Logo */}
          <Link to="/" className={styles.logo} aria-label="IMO Craft Home">
            <span className={styles.logoIcon}>✦</span>
            <div className={styles.logoText}>
              <span className={styles.logoMain}>IMO Craft</span>
              <span className={styles.logoSub}>Handmade with Love</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className={styles.desktopNav} aria-label="Main navigation">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.active : ''}`
                }
              >
                {link.label}
              </NavLink>
            ))}

            {/* Categories Dropdown */}
            <div
              className={styles.dropdown}
              onMouseEnter={() => setIsCatOpen(true)}
              onMouseLeave={() => setIsCatOpen(false)}
            >
              <button
                className={styles.navLink}
                aria-expanded={isCatOpen}
                aria-haspopup="true"
              >
                Categories ▾
              </button>
              <div className={`${styles.dropdownMenu} ${isCatOpen ? styles.dropdownOpen : ''}`}>
                {categories.map(cat => (
                  <Link
                    key={cat.id}
                    to={`/shop?category=${cat.id}`}
                    className={styles.dropdownItem}
                  >
                    {cat.label}
                  </Link>
                ))}
              </div>
            </div>
          </nav>

          {/* Actions */}
          <div className={styles.actions}>
            {/* Search */}
            <button
              className={styles.iconBtn}
              onClick={() => setIsSearchOpen(s => !s)}
              aria-label="Search"
              aria-expanded={isSearchOpen}
            >
              🔍
            </button>

            {/* Cart */}
            <Link to="/cart" className={styles.cartBtn} aria-label={`Cart with ${cartCount} items`}>
              🛒
              {cartCount > 0 && (
                <span className={styles.cartBadge}>{cartCount > 99 ? '99+' : cartCount}</span>
              )}
            </Link>

            {/* Mobile Hamburger */}
            <button
              className={`${styles.hamburger} ${isMenuOpen ? styles.hamburgerOpen : ''}`}
              onClick={() => setIsMenuOpen(s => !s)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className={`${styles.searchBar} ${isSearchOpen ? styles.searchOpen : ''}`}>
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <input
              ref={searchRef}
              type="search"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search for keychains, bouquets, gifts..."
              className={styles.searchInput}
              id="navbar-search"
            />
            <button type="submit" className={styles.searchSubmit}>Search</button>
            <button
              type="button"
              className={styles.searchClose}
              onClick={() => setIsSearchOpen(false)}
              aria-label="Close search"
            >✕</button>
          </form>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`${styles.mobileMenu} ${isMenuOpen ? styles.mobileMenuOpen : ''}`}
        aria-hidden={!isMenuOpen}
      >
        <nav className={styles.mobileNav}>
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `${styles.mobileNavLink} ${isActive ? styles.mobileActive : ''}`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <div className={styles.mobileDivider}>Categories</div>
          {categories.map(cat => (
            <Link
              key={cat.id}
              to={`/shop?category=${cat.id}`}
              className={styles.mobileCatLink}
            >
              {cat.label}
            </Link>
          ))}
          <div className={styles.mobileCartLink}>
            <Link to="/cart" className={styles.mobileNavLink}>
              🛒 Cart {cartCount > 0 && `(${cartCount})`}
            </Link>
          </div>
        </nav>
      </div>

      {/* Mobile overlay backdrop */}
      {isMenuOpen && (
        <div
          className={styles.backdrop}
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Spacer to prevent content jump under fixed navbar */}
      <div className={styles.navSpacer} />
    </>
  );
}
