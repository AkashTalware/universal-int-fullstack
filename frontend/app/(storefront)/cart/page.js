'use client';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/api';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="empty-state">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--text-faint)"
              strokeWidth="1"
              style={{ margin: '0 auto 20px' }}
            >
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
            </svg>
            <h2
              style={{ fontFamily: 'var(--font-display)', fontSize: '32px', marginBottom: '12px' }}
            >
              Your cart is empty
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '28px' }}>
              Discover furniture crafted to elevate your space.
            </p>
            <Link href="/shop" className="btn btn-primary">
              Browse Collection
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page page-enter">
      <div className="container">
        <div style={{ marginBottom: '40px' }}>
          <p
            style={{
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              marginBottom: '10px',
            }}
          >
            Your Selection
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '40px', fontWeight: 700 }}>
            Cart
          </h1>
        </div>

        <div className="cart-page-grid">
          {/* Items */}
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
              }}
            >
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                {items.length} item{items.length !== 1 ? 's' : ''}
              </p>
              <button className="btn btn-ghost btn-sm" onClick={clearCart}>
                Clear cart
              </button>
            </div>

            <div className="cart-page-items">
              {items.map((item) => {
                const itemPrice = item.sale_price || item.price;
                const hasSale = item.sale_price && item.sale_price < item.price;
                return (
                  <div key={item.id} className="cart-page-item" id={`cart-item-${item.id}`}>
                    <img
                      src={item.images?.[0] || ''}
                      alt={item.name}
                      className="cart-page-img"
                      onError={(e) => {
                        e.target.style.background = 'var(--surface-3)';
                        e.target.style.display = 'block';
                      }}
                    />
                    <div className="cart-page-info">
                      <Link
                        href={`/shop/${item.slug}`}
                        className="cart-page-name"
                        style={{ transition: 'color var(--transition)' }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text)')}
                      >
                        {item.name}
                      </Link>
                      {item.material && (
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                          {item.material}
                        </p>
                      )}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'baseline',
                          gap: '10px',
                          marginTop: '4px',
                        }}
                      >
                        <span style={{ fontSize: '18px', fontWeight: 700 }}>
                          {formatPrice(itemPrice)}
                        </span>
                        {hasSale && (
                          <span
                            style={{
                              fontSize: '13px',
                              color: 'var(--text-faint)',
                              textDecoration: 'line-through',
                            }}
                          >
                            {formatPrice(item.price)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        gap: '12px',
                        flexShrink: 0,
                      }}
                    >
                      <div className="cart-qty">
                        <button
                          className="qty-btn"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          −
                        </button>
                        <span className="qty-val">{item.quantity}</span>
                        <button
                          className="qty-btn"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      <p
                        style={{
                          fontSize: '16px',
                          fontWeight: 600,
                          fontFamily: 'var(--font-display)',
                        }}
                      >
                        {formatPrice(itemPrice * item.quantity)}
                      </p>
                      <button
                        onClick={() => removeItem(item.id)}
                        style={{
                          fontSize: '12px',
                          color: 'var(--text-faint)',
                          transition: 'color var(--transition)',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--danger)')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-faint)')}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary */}
          <div className="cart-summary">
            <h3>Order Summary</h3>
            {items.map((item) => (
              <div key={item.id} className="summary-row">
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>{formatPrice((item.sale_price || item.price) * item.quantity)}</span>
              </div>
            ))}
            <div className="summary-total">
              <span>Estimated Total</span>
              <span style={{ color: 'var(--accent)' }}>{formatPrice(total)}</span>
            </div>

            <div className="cart-inquiry-note">
              ℹ️ These are estimated prices. Our team will provide a confirmed quote with delivery
              charges after you submit your inquiry.
            </div>

            <Link
              href="/checkout"
              className="btn btn-primary w-full"
              style={{ justifyContent: 'center', marginTop: '8px' }}
              id="proceed-to-checkout"
            >
              Proceed to Inquiry
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

            <Link
              href="/shop"
              className="btn btn-ghost w-full"
              style={{ justifyContent: 'center', marginTop: '10px' }}
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
