import { createContext, useContext, useState, useCallback } from 'react';
import { products as initialProducts, categories as initialCategories } from '../data/products';
import {
  adminOrders as initialOrders,
  adminCustomers,
  adminReviews as initialReviews,
  adminPayments as initialPayments,
  deliveries as initialDeliveries,
} from '../data/adminData';

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  // ── Products ──────────────────────────────────────────────
  const [products, setProducts] = useState(() =>
    initialProducts.map(p => ({ ...p, enabled: true, images: p.images || [] }))
  );

  const addProduct = useCallback((product) => {
    setProducts(prev => [...prev, { ...product, id: Date.now(), enabled: true }]);
  }, []);

  const updateProduct = useCallback((id, updates) => {
    setProducts(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));
  }, []);

  const deleteProduct = useCallback((id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  }, []);

  // ── Categories ────────────────────────────────────────────
  const [categories, setCategories] = useState(initialCategories);

  const addCategory = useCallback((cat) => {
    setCategories(prev => [...prev, { ...cat, id: cat.name.toLowerCase().replace(/\s+/g, '-'), count: 0 }]);
  }, []);

  const updateCategory = useCallback((id, updates) => {
    setCategories(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)));
  }, []);

  const deleteCategory = useCallback((id) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  }, []);

  // ── Orders ────────────────────────────────────────────────
  const [orders, setOrders] = useState(initialOrders);

  const updateOrderStatus = useCallback((id, orderStatus) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, orderStatus, updatedAt: new Date().toISOString() } : o));
  }, []);

  const updateDeliveryStatus = useCallback((id, deliveryStatus) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, deliveryStatus, updatedAt: new Date().toISOString() } : o));
  }, []);

  const updatePaymentStatus = useCallback((id, paymentStatus) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, paymentStatus, updatedAt: new Date().toISOString() } : o));
  }, []);

  // ── Reviews ───────────────────────────────────────────────
  const [reviews, setReviews] = useState(initialReviews);

  const updateReviewStatus = useCallback((id, status) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  }, []);

  const deleteReview = useCallback((id) => {
    setReviews(prev => prev.filter(r => r.id !== id));
  }, []);

  // ── Payments ──────────────────────────────────────────────
  const [payments, setPayments] = useState(initialPayments);

  // ── Deliveries ────────────────────────────────────────────
  const [deliveries, setDeliveries] = useState(initialDeliveries);

  const updateDelivery = useCallback((id, updates) => {
    setDeliveries(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  }, []);

  // ── Derived stats ─────────────────────────────────────────
  const stats = {
    totalOrders: orders.length,
    totalSales: orders
      .filter(o => o.paymentStatus === 'Paid')
      .reduce((sum, o) => sum + o.total, 0),
    pendingOrders: orders.filter(o => o.orderStatus === 'Pending').length,
    processingOrders: orders.filter(o => o.orderStatus === 'Processing').length,
    completedOrders: orders.filter(o => o.orderStatus === 'Delivered').length,
    cancelledOrders: orders.filter(o => o.orderStatus === 'Cancelled').length,
    totalProducts: products.length,
    lowStockProducts: products.filter(p => p.stock <= 5).length,
    totalCustomers: adminCustomers.length,
    pendingReviews: reviews.filter(r => r.status === 'Pending').length,
  };

  return (
    <AdminContext.Provider value={{
      // products
      products, addProduct, updateProduct, deleteProduct,
      // categories
      categories, addCategory, updateCategory, deleteCategory,
      // orders
      orders, updateOrderStatus, updateDeliveryStatus, updatePaymentStatus,
      // reviews
      reviews, updateReviewStatus, deleteReview,
      // payments
      payments, setPayments,
      // deliveries
      deliveries, updateDelivery,
      // customers (read-only mock)
      customers: adminCustomers,
      // stats
      stats,
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used inside AdminProvider');
  return ctx;
}
