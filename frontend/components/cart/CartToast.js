'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/api';

export default function CartToast() {
  const { toastItem, clearToast, setCartOpen, itemCount } = useCart();
  const [visible, setVisible] = useState(false);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);
  const progressRef = useRef(null);

  useEffect(() => {
    if (toastItem) {
      setVisible(true);
      // Auto-hide after 4.2 seconds
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        handleClose();
      }, 4200);
    }
  }, [toastItem?.key]);

  function handleClose() {
    setVisible(false);
    setTimeout(() => {
      clearToast();
    }, 300); // match fade transition
  }

  function handleViewCart() {
    handleClose();
    setCartOpen(true);
  }

  if (!toastItem && !visible) return null;

  const itemPrice = toastItem?.sale_price || toastItem?.price || 0;
  const itemImg = toastItem?.images?.[0];

  return (
    <div
      className={`cart-toast ${visible ? 'cart-toast-visible' : ''}`}
      onMouseEnter={() => {
        setPaused(true);
        if (timerRef.current) clearTimeout(timerRef.current);
      }}
      onMouseLeave={() => {
        setPaused(false);
        timerRef.current = setTimeout(() => handleClose(), 2000);
      }}
      role="status"
      aria-live="polite"
    >
      {/* Top status bar */}
      <div className="cart-toast-header">
        <div className="cart-toast-badge">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>Added to Cart</span>
        </div>
        <button
          className="cart-toast-close"
          onClick={handleClose}
          aria-label="Dismiss notification"
        >
          ✕
        </button>
      </div>

      {/* Item info */}
      <div className="cart-toast-body">
        {itemImg ? (
          <img src={itemImg} alt={toastItem.name} className="cart-toast-img" />
        ) : (
          <div className="cart-toast-img cart-toast-img-placeholder">🛋️</div>
        )}
        <div className="cart-toast-details">
          <h4 className="cart-toast-title">{toastItem.name}</h4>
          <p className="cart-toast-price">
            {formatPrice(itemPrice)}{' '}
            {toastItem.addedQuantity > 1 && (
              <span className="cart-toast-qty">× {toastItem.addedQuantity}</span>
            )}
          </p>
          <span className="cart-toast-count-pill">
            {itemCount} {itemCount === 1 ? 'item' : 'items'} in cart
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="cart-toast-actions">
        <button className="btn btn-outline btn-sm cart-toast-btn" onClick={handleViewCart}>
          View Cart
        </button>
        <Link
          href="/checkout"
          className="btn btn-primary btn-sm cart-toast-btn"
          onClick={handleClose}
        >
          Checkout →
        </Link>
      </div>

      {/* Progress animation bar */}
      <div className={`cart-toast-progress ${paused ? 'paused' : ''}`} key={toastItem?.key} />
    </div>
  );
}
