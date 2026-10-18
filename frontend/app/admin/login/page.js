'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, setAdminToken } from '@/lib/api';

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [sessionNotice, setSessionNotice] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('expired')) {
        setSessionNotice('Your session has expired or is invalid. Please sign in again.');
      }
    }
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSessionNotice('');
    setLoading(true);
    try {
      const { token } = await api.login(form);
      setAdminToken(token);
      router.push('/admin');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-login-wrap page-enter" style={{ position: 'relative', padding: '24px' }}>
      {/* Top Bar Return Link */}
      <Link
        href="/"
        id="admin-login-top-return"
        className="btn btn-ghost btn-sm"
        style={{
          position: 'absolute',
          top: '24px',
          left: '24px',
          color: 'var(--text-muted)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13px',
          textDecoration: 'none',
        }}
      >
        <span>←</span>
        <span>Return to Storefront</span>
      </Link>

      <div className="admin-login-card">
        {/* Header with Logo & Storefront Quick Link */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '36px',
            gap: '12px',
          }}
        >
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700 }}>
              Universal Int Studio
            </div>
            <div
              style={{
                fontSize: '10px',
                letterSpacing: '0.25em',
                color: 'var(--accent)',
                textTransform: 'uppercase',
                marginTop: '4px',
              }}
            >
              Admin Panel
            </div>
          </div>
          <Link
            href="/"
            id="admin-login-card-return"
            className="btn btn-outline btn-sm"
            style={{
              fontSize: '11px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              whiteSpace: 'nowrap',
            }}
          >
            Storefront →
          </Link>
        </div>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', marginBottom: '8px' }}>
          Sign In
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '32px' }}>
          Enter your admin credentials to continue.
        </p>

        <form onSubmit={handleSubmit} id="admin-login-form">
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" htmlFor="admin-username">
              Username
            </label>
            <input
              id="admin-username"
              className="input"
              placeholder="Username"
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label" htmlFor="admin-password">
              Password
            </label>
            <input
              id="admin-password"
              className="input"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              autoComplete="current-password"
              required
            />
          </div>

          {sessionNotice && (
            <div
              style={{
                background: 'rgba(217, 119, 6, 0.1)',
                border: '1px solid rgba(217, 119, 6, 0.35)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 16px',
                marginBottom: '20px',
                fontSize: '13px',
                color: 'var(--warning)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>⚠</span>
              <span>{sessionNotice}</span>
            </div>
          )}

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
            id="admin-login-submit"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <Link
            href="/"
            id="admin-login-bottom-return"
            style={{
              fontSize: '13px',
              color: 'var(--text-muted)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              textDecoration: 'none',
              transition: 'color var(--transition)',
            }}
          >
            <span>←</span>
            <span>Return to Storefront</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
