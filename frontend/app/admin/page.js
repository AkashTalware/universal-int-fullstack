'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, getAdminToken, clearAdminToken, isTokenExpired } from '@/lib/api';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({ products: 0, categories: 0, inquiries: 0, newInquiries: 0 });
  const [recentInquiries, setRecentInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAdminToken();
    if (!token || isTokenExpired(token)) {
      clearAdminToken();
      router.push('/admin/login?expired=1');
      return;
    }

    async function load() {
      try {
        const [products, categories, inquiries] = await Promise.all([
          api.getProducts(),
          api.getCategories(),
          api.getInquiries(token),
        ]);
        setStats({
          products: products.length,
          categories: categories.length,
          inquiries: inquiries.length,
          newInquiries: inquiries.filter((i) => i.status === 'new').length,
        });
        setRecentInquiries(inquiries.slice(0, 5));
      } catch (e) {
        if (e.status === 401 || e.message?.toLowerCase().includes('unauthorized')) {
          clearAdminToken();
          router.push('/admin/login?expired=1');
          return;
        }
        console.error('Failed to load dashboard data:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  const STAT_CARDS = [
    { label: 'Total Products', value: stats.products, icon: '⊞', color: 'var(--accent)' },
    { label: 'Categories', value: stats.categories, icon: '◉', color: '#7c9fe6' },
    { label: 'Total Inquiries', value: stats.inquiries, icon: '✉', color: '#7ec98a' },
    {
      label: 'New Inquiries',
      value: stats.newInquiries,
      icon: '★',
      color: 'var(--warning)',
      highlight: true,
    },
  ];

  return (
    <div>
      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: '40px' }}>
        {STAT_CARDS.map((s) => (
          <div
            key={s.label}
            className={`stat-card${s.highlight && s.value > 0 ? ' card' : ''}`}
            style={
              s.highlight && s.value > 0 ? { borderColor: 'var(--warning)', borderWidth: 1 } : {}
            }
          >
            <div style={{ fontSize: '28px', marginBottom: '12px', opacity: 0.6 }}>{s.icon}</div>
            <div className="stat-value" style={{ color: s.color }}>
              {loading ? '–' : s.value}
            </div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '40px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <Link href="/admin/products/new" className="btn btn-primary" id="dash-add-product">
          + Add Product
        </Link>
        <Link href="/admin/categories" className="btn btn-outline" id="dash-manage-cats">
          Manage Categories
        </Link>
        <Link href="/admin/inquiries" className="btn btn-ghost" id="dash-view-inquiries">
          View Inquiries
        </Link>
      </div>

      {/* Recent Inquiries */}
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px' }}>Recent Inquiries</h2>
          <Link href="/admin/inquiries" className="btn btn-ghost btn-sm">
            View All →
          </Link>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="skeleton"
                style={{ height: '60px', borderRadius: 'var(--radius)' }}
              />
            ))}
          </div>
        ) : recentInquiries.length === 0 ? (
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border-2)',
              borderRadius: 'var(--radius)',
              padding: '32px',
              textAlign: 'center',
              color: 'var(--text-muted)',
            }}
          >
            No inquiries yet. They'll appear here once customers submit their carts.
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Items</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentInquiries.map((inq) => (
                  <tr key={inq.id}>
                    <td style={{ fontWeight: 500 }}>{inq.name}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{inq.email}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                      {inq.cart_items?.length || 0} item{inq.cart_items?.length !== 1 ? 's' : ''}
                    </td>
                    <td>
                      <span
                        className={`badge badge-${inq.status === 'new' ? 'accent' : inq.status === 'contacted' ? 'success' : 'muted'}`}
                      >
                        {inq.status}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-faint)', fontSize: '13px' }}>
                      {new Date(inq.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
