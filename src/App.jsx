import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AdminProvider } from './context/AdminContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import OrderTracking from './pages/OrderTracking';
import About from './pages/About';
import Contact from './pages/Contact';
import ScrollToTop from './components/utils/ScrollToTop';

// Admin
import AdminLayout from './admin/AdminLayout';
import Dashboard   from './admin/pages/Dashboard';
import Products    from './admin/pages/Products';
import Categories  from './admin/pages/Categories';
import Orders      from './admin/pages/Orders';
import Customers   from './admin/pages/Customers';
import Reviews     from './admin/pages/Reviews';
import Delivery    from './admin/pages/Delivery';
import Payments    from './admin/pages/Payments';
import Reports     from './admin/pages/Reports';
import Settings    from './admin/pages/Settings';

import './index.css';

function App() {
  return (
    <Router>
      <AdminProvider>
        <CartProvider>
          <ScrollToTop />
          <Routes>
            {/* ── Admin routes (no Navbar/Footer) ── */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index        element={<Dashboard />} />
              <Route path="products"   element={<Products />} />
              <Route path="categories" element={<Categories />} />
              <Route path="orders"     element={<Orders />} />
              <Route path="customers"  element={<Customers />} />
              <Route path="reviews"    element={<Reviews />} />
              <Route path="delivery"   element={<Delivery />} />
              <Route path="payments"   element={<Payments />} />
              <Route path="reports"    element={<Reports />} />
              <Route path="settings"   element={<Settings />} />
            </Route>

            {/* ── Public store routes ── */}
            <Route path="/*" element={
              <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Navbar />
                <div style={{ flex: 1 }}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/order-confirmation" element={<OrderConfirmation />} />
                    <Route path="/order-tracking" element={<OrderTracking />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="*" element={
                      <main style={{ textAlign: 'center', padding: '8rem 2rem' }}>
                        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '4rem', color: 'var(--accent-rose)' }}>404</h1>
                        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginTop: '1rem' }}>Page not found</p>
                        <a href="/" style={{ display: 'inline-block', marginTop: '2rem', padding: '0.8rem 2rem', background: 'var(--accent-rose)', color: '#fff', borderRadius: '99px', fontWeight: 700 }}>Go Home</a>
                      </main>
                    } />
                  </Routes>
                </div>
                <Footer />
              </div>
            } />
          </Routes>
        </CartProvider>
      </AdminProvider>
    </Router>
  );
}

export default App;
