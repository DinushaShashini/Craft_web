import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const stored = localStorage.getItem('imocraft-cart');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Persist cart to localStorage
  useEffect(() => {
    localStorage.setItem('imocraft-cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1, customization = '') => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id && item.customization === customization);
      if (existing) {
        return prev.map(item =>
          item.id === product.id && item.customization === customization
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity, customization }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id, customization = '') => {
    setCartItems(prev => prev.filter(item => !(item.id === id && item.customization === customization)));
  };

  const updateQuantity = (id, quantity, customization = '') => {
    if (quantity <= 0) {
      removeFromCart(id, customization);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.id === id && item.customization === customization
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => setCartItems([]);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartSubtotal = cartTotal;

  return (
    <CartContext.Provider value={{
      cartItems,
      cartCount,
      cartTotal,
      cartSubtotal,
      isCartOpen,
      setIsCartOpen,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
