'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getAdminToken, clearAdminToken, isTokenExpired } from '@/lib/api';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: '◈' },
  { href: '/admin/products', label: 'Products', icon: '⊞' },
  { href: '/admin/categories', label: 'Categories', icon: '◉' },
  { href: '/admin/inquiries', label: 'Inquiries', icon: '✉' },
];

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/admin/login') return;
    const token = getAdminToken();
    if (!token || isTokenExpired(token)) {
      clearAdminToken();
      const returnTo = encodeURIComponent(pathname + (typeof window !== 'undefined' ? window.location.search : ''));
      router.push(`/admin/login?expired=1&returnTo=${returnTo}`);
    }
  }, [pathname, router]);

  if (pathname === '/admin/login') return <>{children}</>;

  function logout() {
    clearAdminToken();
    router.push('/admin/login');
  }

  const pageTitle =
    NAV.find((n) => n.href === pathname)?.label ||
    (pathname.includes('/products/new')
      ? 'New Product'
      : pathname.includes('/products/')
        ? 'Edit Product'
        : 'Admin');

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="admin-logo-main">Universal Int Studio</div>
          <div className="admin-logo-sub">Admin Panel</div>
        </div>

        <nav className="admin-nav">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`admin-nav-link${pathname === n.href ? ' active' : ''}`}
              id={`admin-nav-${n.label.toLowerCase()}`}
            >
              <span className="admin-nav-icon">{n.icon}</span>
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <button className="admin-nav-link w-full" onClick={logout} id="admin-logout">
            <span className="admin-nav-icon">⎋</span>
            Logout
          </button>
          <div style={{ marginTop: '12px' }}>
            <Link
              href="/"
              style={{
                fontSize: '12px',
                color: 'var(--text-faint)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              ← View Storefront
            </Link>
          </div>
        </div>
      </aside>

      {/* Content */}
      <div className="admin-content">
        <div className="admin-topbar">
          <h1>{pageTitle}</h1>
        </div>
        <main className="admin-main page-enter">{children}</main>
      </div>
    </div>
  );
}
