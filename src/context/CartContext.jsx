import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext(null);

// ── Coupon definitions ──────────────────────────────────────────
// Add / remove coupons here. type: 'percent' | 'fixed'
const COUPONS = {
  'IMOCRAFT10':  { type: 'percent', value: 10,  label: '10% off your order' },
  'WELCOME15':   { type: 'percent', value: 15,  label: '15% welcome discount' },
  'FLAT200':     { type: 'fixed',   value: 200, label: 'Rs. 200 off your order' },
  'FREESHIP':    { type: 'shipping',value: 0,   label: 'Free shipping on this order' },
};

const FREE_SHIPPING_THRESHOLD = 2000;  // orders above this get free shipping
const STANDARD_SHIPPING        = 200;  // default shipping fee in Rs.

export function CartProvider({ children }) {
  // Cart items — persisted in localStorage
  const [cartItems, setCartItems] = useState(() => {
    try {
      const stored = localStorage.getItem('imocraft-cart');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  // Applied coupon
  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      const stored = localStorage.getItem('imocraft-coupon');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  // Persist cart
  useEffect(() => {
    localStorage.setItem('imocraft-cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Persist coupon
  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('imocraft-coupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('imocraft-coupon');
    }
  }, [appliedCoupon]);

  // ── Cart mutations ──────────────────────────────────────────
  const addToCart = useCallback((product, quantity = 1, customization = '') => {
    setCartItems(prev => {
      const existing = prev.find(
        item => item.id === product.id && item.customization === customization
      );
      if (existing) {
        return prev.map(item =>
          item.id === product.id && item.customization === customization
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity, customization }];
    });
  }, []);

  const removeFromCart = useCallback((id, customization = '') => {
    setCartItems(prev =>
      prev.filter(item => !(item.id === id && item.customization === customization))
    );
  }, []);

  const updateQuantity = useCallback((id, quantity, customization = '') => {
    if (quantity <= 0) { removeFromCart(id, customization); return; }
    setCartItems(prev =>
      prev.map(item =>
        item.id === id && item.customization === customization
          ? { ...item, quantity }
          : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCartItems([]);
    setAppliedCoupon(null);
  }, []);

  // ── Coupon logic ────────────────────────────────────────────
  const applyCoupon = useCallback((code) => {
    const trimmed = code.trim().toUpperCase();
    const coupon = COUPONS[trimmed];
    if (!coupon) return { ok: false, error: 'Invalid coupon code. Please check and try again.' };
    setAppliedCoupon({ code: trimmed, ...coupon });
    return { ok: true, label: coupon.label };
  }, []);

  const removeCoupon = useCallback(() => setAppliedCoupon(null), []);

  // ── Derived values ──────────────────────────────────────────
  const cartCount   = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Coupon discount
  let couponDiscount = 0;
  let freeShippingFromCoupon = false;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percent') {
      couponDiscount = Math.round((cartSubtotal * appliedCoupon.value) / 100);
    } else if (appliedCoupon.type === 'fixed') {
      couponDiscount = Math.min(appliedCoupon.value, cartSubtotal);
    } else if (appliedCoupon.type === 'shipping') {
      freeShippingFromCoupon = true;
    }
  }

  const afterDiscount = Math.max(0, cartSubtotal - couponDiscount);
  const shipping      = freeShippingFromCoupon || afterDiscount >= FREE_SHIPPING_THRESHOLD
    ? 0
    : cartItems.length === 0 ? 0 : STANDARD_SHIPPING;
  const cartTotal     = afterDiscount + shipping;

  return (
    <CartContext.Provider value={{
      cartItems,
      cartCount,
      cartSubtotal,
      couponDiscount,
      shipping,
      cartTotal,
      appliedCoupon,
      FREE_SHIPPING_THRESHOLD,
      STANDARD_SHIPPING,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      applyCoupon,
      removeCoupon,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
