'use client';
import { createContext, useContext, useState, useEffect, useRef } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [toastItem, setToastItem] = useState(null);
  const [cartBump, setCartBump] = useState(false);
  const bumpTimeoutRef = useRef(null);

  useEffect(() => {
    try {
      const saved =
        localStorage.getItem('universal_cart') || localStorage.getItem('luxespace_cart');
      if (saved) setItems(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem('universal_cart', JSON.stringify(items));
  }, [items]);

  function addItem(product, quantity = 1, options = {}, openDrawer = false) {
    const opts = typeof options === 'object' && options !== null ? options : {};
    const shouldOpen = typeof options === 'boolean' ? options : openDrawer;
    const selectedDim = opts.dimensions || product.dimensions || null;
    const selectedMat = opts.material || product.material || null;
    const selectedFinish = opts.finish || product.finish || null;
    const itemKey = `${product.id}-${selectedDim || ''}-${selectedMat || ''}-${selectedFinish || ''}`;

    setItems((prev) => {
      const existing = prev.find(
        (i) => i.itemKey === itemKey || (i.id === product.id && !i.itemKey && !opts.dimensions)
      );
      if (existing) {
        return prev.map((i) =>
          i.itemKey === itemKey || (i.id === product.id && !i.itemKey && !opts.dimensions)
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [
        ...prev,
        {
          ...product,
          itemKey,
          quantity,
          selectedDimensions: selectedDim,
          selectedMaterial: selectedMat,
          selectedFinish: selectedFinish,
        },
      ];
    });

    // Trigger cart badge bump animation in header
    setCartBump(true);
    if (bumpTimeoutRef.current) clearTimeout(bumpTimeoutRef.current);
    bumpTimeoutRef.current = setTimeout(() => setCartBump(false), 600);

    // Show floating toast notification instead of opening entire drawer
    setToastItem({
      ...product,
      addedQuantity: quantity,
      selectedDimensions: selectedDim,
      selectedMaterial: selectedMat,
      selectedFinish: selectedFinish,
      key: Date.now(),
    });

    if (shouldOpen) {
      setCartOpen(true);
    }
  }

  function clearToast() {
    setToastItem(null);
  }

  function removeItem(id) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function updateQuantity(id, quantity) {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)));
  }

  function clearCart() {
    setItems([]);
  }

  function handleSetCartOpen(val) {
    const nextVal = typeof val === 'function' ? val(cartOpen) : val;
    if (nextVal && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('close-quickview'));
      window.dispatchEvent(new CustomEvent('close-all-modals'));
    }
    setCartOpen(nextVal);
  }

  const total = items.reduce((sum, i) => sum + (i.sale_price || i.price) * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        total,
        itemCount,
        cartOpen,
        setCartOpen: handleSetCartOpen,
        toastItem,
        clearToast,
        cartBump,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
