'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, formatPrice, getAdminToken, clearAdminToken, isTokenExpired } from '@/lib/api';

const STATUS_OPTS = ['new', 'contacted', 'closed'];

export default function AdminInquiriesPage() {
  const router = useRouter();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const token = getAdminToken();
    if (!token || isTokenExpired(token)) {
      clearAdminToken();
      router.push('/admin/login?expired=1');
      return;
    }
    setLoading(true);
    try {
      setInquiries(await api.getInquiries(token));
    } catch (e) {
      if (e.status === 401 || e.message?.toLowerCase().includes('unauthorized')) {
        clearAdminToken();
        router.push('/admin/login?expired=1');
        return;
      }
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id, status) {
    const token = getAdminToken();
    if (!token || isTokenExpired(token)) {
      clearAdminToken();
      router.push('/admin/login?expired=1');
      return;
    }
    try {
      await api.updateInquiry(id, { status }, token);
      setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
      if (selected?.id === id) setSelected((s) => ({ ...s, status }));
    } catch (err) {
      if (err.status === 401 || err.message?.toLowerCase().includes('unauthorized')) {
        clearAdminToken();
        router.push('/admin/login?expired=1');
        return;
      }
      alert(err.message);
    }
  }

  const statusBadge = (s) => (s === 'new' ? 'accent' : s === 'contacted' ? 'success' : 'muted');

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: selected ? '1fr 400px' : '1fr',
        gap: '28px',
        alignItems: 'start',
      }}
    >
      {/* Table */}
      <div className="admin-table-wrap">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading...
          </div>
        ) : inquiries.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No inquiries yet.
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Email</th>
                <th>Items</th>
                <th>Est. Value</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map((inq) => {
                const total =
                  inq.cart_items?.reduce((s, i) => s + (i.sale_price || i.price) * i.quantity, 0) ||
                  0;
                return (
                  <tr
                    key={inq.id}
                    id={`inq-row-${inq.id}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelected(selected?.id === inq.id ? null : inq)}
                  >
                    <td style={{ fontWeight: 500 }}>{inq.name}</td>
                    <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{inq.email}</td>
                    <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      {inq.cart_items?.length || 0}
                    </td>
                    <td style={{ fontWeight: 600 }}>{formatPrice(total)}</td>
                    <td>
                      <select
                        className="sort-select"
                        style={{ fontSize: '12px', padding: '4px 10px' }}
                        value={inq.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => updateStatus(inq.id, e.target.value)}
                        id={`inq-status-${inq.id}`}
                      >
                        {STATUS_OPTS.map((s) => (
                          <option key={s} value={s}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--text-faint)' }}>
                      {new Date(inq.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: '2-digit',
                      })}
                    </td>
                    <td>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelected(selected?.id === inq.id ? null : inq);
                        }}
                      >
                        {selected?.id === inq.id ? 'Close' : 'View'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail panel */}
      {selected && (
        <div
          className="admin-form-card"
          style={{ padding: '28px', position: 'sticky', top: '80px' }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '20px',
            }}
          >
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px' }}>
              Inquiry #{selected.id}
            </h3>
            <button
              onClick={() => setSelected(null)}
              style={{ color: 'var(--text-faint)', fontSize: '18px', lineHeight: 1 }}
            >
              ×
            </button>
          </div>

          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}
          >
            {[
              ['Name', selected.name],
              ['Email', selected.email],
              ['Phone', selected.phone || '—'],
              ['Date', new Date(selected.created_at).toLocaleString('en-IN')],
            ].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', gap: '12px', fontSize: '14px' }}>
                <span style={{ color: 'var(--text-faint)', width: '64px', flexShrink: 0 }}>
                  {l}
                </span>
                <span style={{ fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>

          {selected.message && (
            <div
              style={{
                background: 'var(--surface-2)',
                borderRadius: 'var(--radius-sm)',
                padding: '14px',
                marginBottom: '20px',
                fontSize: '13px',
                color: 'var(--text-muted)',
                lineHeight: 1.6,
              }}
            >
              <p
                style={{
                  fontWeight: 600,
                  marginBottom: '6px',
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--text-faint)',
                }}
              >
                Message
              </p>
              {selected.message}
            </div>
          )}

          <p
            style={{
              fontWeight: 600,
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-faint)',
              marginBottom: '12px',
            }}
          >
            Cart Items ({selected.cart_items?.length || 0})
          </p>
          {selected.cart_items?.map((item, i) => (
            <div
              key={i}
              className="order-item"
              style={{
                display: 'flex',
                gap: '12px',
                padding: '10px 0',
                borderBottom: '1px solid var(--border-2)',
              }}
            >
              <img
                src={item.images?.[0] || ''}
                alt={item.name}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-sm)',
                  objectFit: 'cover',
                  background: 'var(--surface-3)',
                }}
              />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '13px', fontWeight: 500 }}>{item.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Qty: {item.quantity}</p>
              </div>
              <span style={{ fontSize: '13px', fontWeight: 600 }}>
                {formatPrice((item.sale_price || item.price) * item.quantity)}
              </span>
            </div>
          ))}

          <div
            style={{
              marginTop: '16px',
              paddingTop: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              fontWeight: 700,
            }}
          >
            <span>Estimated Total</span>
            <span style={{ color: 'var(--accent)' }}>
              {formatPrice(
                selected.cart_items?.reduce(
                  (s, i) => s + (i.sale_price || i.price) * i.quantity,
                  0
                ) || 0
              )}
            </span>
          </div>

          <div style={{ marginTop: '20px' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-faint)', marginBottom: '10px' }}>
              Update Status
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              {STATUS_OPTS.map((s) => (
                <button
                  key={s}
                  className={`btn btn-sm ${selected.status === s ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => updateStatus(selected.id, s)}
                  id={`inq-panel-status-${s}`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
