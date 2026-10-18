'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { api, formatPrice } from '@/lib/api';

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  function update(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (items.length === 0) {
      setError('Your cart is empty.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.submitInquiry({ ...form, cart_items: items });
      clearCart();
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="success-state page-enter">
            <div className="success-icon">✓</div>
            <h2
              style={{ fontFamily: 'var(--font-display)', fontSize: '36px', marginBottom: '12px' }}
            >
              Inquiry Submitted!
            </h2>
            <p
              style={{
                color: 'var(--text-muted)',
                fontSize: '17px',
                maxWidth: '480px',
                margin: '0 auto 32px',
              }}
            >
              Thank you, <strong>{form.name}</strong>! Our team will review your selection and reach
              out at <strong>{form.email}</strong> within 24 hours with a personalised quote.
            </p>
            <Link href="/shop" className="btn btn-primary btn-lg">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="checkout-page">
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', marginBottom: '16px' }}>
            Your cart is empty
          </h2>
          <Link href="/shop" className="btn btn-primary">
            Browse Collection
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page page-enter">
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
            Almost there
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '40px', fontWeight: 700 }}>
            Request a Quote
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
            Share your details and our team will reach out within 24 hours.
          </p>
        </div>

        <div className="checkout-grid">
          {/* Form */}
          <div className="checkout-form-card">
            <h2>Your Details</h2>
            <form onSubmit={handleSubmit} id="checkout-form">
              <div className="form-grid-2" style={{ marginBottom: '20px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="checkout-name">
                    Full Name *
                  </label>
                  <input
                    id="checkout-name"
                    name="name"
                    className="input"
                    placeholder="Your name"
                    value={form.name}
                    onChange={update}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="checkout-phone">
                    Phone Number
                  </label>
                  <input
                    id="checkout-phone"
                    name="phone"
                    className="input"
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={update}
                    type="tel"
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label" htmlFor="checkout-email">
                  Email Address *
                </label>
                <input
                  id="checkout-email"
                  name="email"
                  className="input"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={update}
                  required
                  type="email"
                />
              </div>

              <div className="form-group" style={{ marginBottom: '28px' }}>
                <label className="form-label" htmlFor="checkout-message">
                  Message (optional)
                </label>
                <textarea
                  id="checkout-message"
                  name="message"
                  className="textarea"
                  placeholder="Any specific requirements, finish preferences, delivery location, etc."
                  value={form.message}
                  onChange={update}
                />
              </div>

              {error && (
                <div
                  style={{
                    background: 'rgba(248,113,113,0.1)',
                    border: '1px solid rgba(248,113,113,0.3)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px 16px',
                    marginBottom: '20px',
                    fontSize: '14px',
                    color: 'var(--danger)',
                  }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary w-full"
                style={{ justifyContent: 'center' }}
                disabled={loading}
                id="checkout-submit"
              >
                {loading ? 'Submitting...' : 'Submit Inquiry'}
                {!loading && (
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
                )}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="checkout-order">
            <h3>Your Selection</h3>
            {items.map((item) => (
              <div key={item.id} className="order-item">
                <img src={item.images?.[0] || ''} alt={item.name} className="order-item-img" />
                <div style={{ flex: 1 }}>
                  <p className="order-item-name">{item.name}</p>
                  <p className="order-item-qty">Qty: {item.quantity}</p>
                </div>
                <span className="order-item-price">
                  {formatPrice((item.sale_price || item.price) * item.quantity)}
                </span>
              </div>
            ))}

            <div
              style={{
                marginTop: '20px',
                paddingTop: '16px',
                borderTop: '1px solid var(--border-2)',
              }}
            >
              <div className="summary-total">
                <span style={{ fontSize: '16px', color: 'var(--text-muted)' }}>
                  Estimated Total
                </span>
                <span style={{ color: 'var(--accent)' }}>{formatPrice(total)}</span>
              </div>
            </div>

            <div
              style={{
                marginTop: '20px',
                padding: '14px',
                background: 'var(--surface-2)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
                color: 'var(--text-faint)',
                lineHeight: 1.6,
              }}
            >
              ℹ️ Final pricing will be confirmed by our team after reviewing your inquiry.
            </div>

            <Link
              href="/cart"
              className="btn btn-ghost w-full"
              style={{ justifyContent: 'center', marginTop: '12px', fontSize: '13px' }}
            >
              ← Edit Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
