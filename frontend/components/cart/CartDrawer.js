'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/api';

export default function CartDrawer() {
  const { items, cartOpen, setCartOpen, removeItem, updateQuantity, total } = useCart();

  // Prevent background main page from scrolling when cart drawer is open
  useEffect(() => {
    if (cartOpen) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalBodyOverflow || '';
        document.documentElement.style.overflow = originalHtmlOverflow || '';
      };
    }
  }, [cartOpen]);

  if (!cartOpen) return null;

  return (
    <>
      <div className="cart-overlay" onClick={() => setCartOpen(false)} aria-hidden="true" />
      <aside className="cart-drawer" role="dialog" aria-label="Shopping cart" aria-modal="true">
        {/* Header */}
        <div className="cart-header">
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 600 }}>
              Your Cart
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </p>
          </div>
          <button className="cart-close" onClick={() => setCartOpen(false)} aria-label="Close cart">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="cart-items">
          {items.length === 0 ? (
            <div className="cart-empty">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                style={{ opacity: 0.3 }}
              >
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
              </svg>
              <p style={{ fontSize: '16px', fontFamily: 'var(--font-display)' }}>
                Your cart is empty
              </p>
              <p style={{ fontSize: '13px' }}>Browse our collection and add something beautiful.</p>
              <button className="btn btn-outline btn-sm" onClick={() => setCartOpen(false)}>
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="cart-item">
                {item.images?.[0] && (
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="cart-item-img"
                    loading="lazy"
                  />
                )}
                <div className="cart-item-info">
                  <p className="cart-item-name">{item.name}</p>
                  {(item.selectedDimensions || item.selectedMaterial) && (
                    <p style={{ fontSize: '11px', color: 'var(--text-faint)', lineHeight: 1.4 }}>
                      {[item.selectedDimensions, item.selectedMaterial, item.selectedFinish]
                        .filter(Boolean)
                        .join(' • ')}
                    </p>
                  )}
                  <p className="cart-item-price">{formatPrice(item.sale_price || item.price)}</p>
                  <div className="cart-qty">
                    <button
                      className="qty-btn"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="qty-val">{item.quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  className="cart-item-remove"
                  onClick={() => removeItem(item.id)}
                  aria-label={`Remove ${item.name}`}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total-row">
              <span className="cart-total-label">Estimated Total</span>
              <span className="cart-total-value">{formatPrice(total)}</span>
            </div>
            <Link
              href="/checkout"
              className="btn btn-primary w-full"
              style={{ justifyContent: 'center' }}
              onClick={() => setCartOpen(false)}
            >
              Request a Quote
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <p className="cart-note">
              Prices are indicative. Our team will contact you with the final quote.
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
