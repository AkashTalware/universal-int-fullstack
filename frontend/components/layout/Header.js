'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useTheme } from '@/context/ThemeContext';
import CartDrawer from '../cart/CartDrawer';

const CATS = [
  { name: 'Entry Way', slug: 'entryway' },
  { name: 'Living Room', slug: 'living-room' },
  { name: 'Dining Room', slug: 'dining-room' },
  { name: 'Bedroom', slug: 'bedroom' },
  { name: 'Home Office', slug: 'home-office' },
  { name: 'Storage', slug: 'storage' },
];

export default function Header() {
  const { itemCount, setCartOpen, cartBump } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const shopTimeoutRef = useRef(null);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setShopOpen(false);
  }, [pathname]);

  function handleShopMouseEnter() {
    if (shopTimeoutRef.current) clearTimeout(shopTimeoutRef.current);
    setShopOpen(true);
  }

  function handleShopMouseLeave() {
    if (shopTimeoutRef.current) clearTimeout(shopTimeoutRef.current);
    shopTimeoutRef.current = setTimeout(() => {
      setShopOpen(false);
    }, 200);
  }

  return (
    <>
      <header className={`site-header${scrolled ? ' scrolled' : ''}`}>
        <div className="container">
          <div className="header-inner">
            {/* Logo */}
            <Link href="/" className="logo" aria-label="Universal Int Studio Home">
              <span className="logo-main">Universal</span>
              <span className="logo-sub">Int Studio</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="desktop-nav" aria-label="Main navigation">
              <Link href="/" className="nav-link">
                Home
              </Link>

              <div
                className="nav-dropdown"
                onMouseEnter={handleShopMouseEnter}
                onMouseLeave={handleShopMouseLeave}
              >
                <Link href="/shop" className="nav-link">
                  Shop
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="currentColor"
                    style={{
                      opacity: 0.6,
                      transform: shopOpen ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s ease',
                    }}
                  >
                    <path d="M5 7L1 3h8L5 7z" />
                  </svg>
                </Link>
                {shopOpen && (
                  <div className="dropdown-menu" role="menu">
                    <Link
                      href="/shop"
                      className="dropdown-item"
                      role="menuitem"
                      onClick={() => setShopOpen(false)}
                    >
                      All Products
                    </Link>
                    <div className="dropdown-sep" />
                    {CATS.map((c) => (
                      <Link
                        key={c.slug}
                        href={`/shop?category=${c.slug}`}
                        className="dropdown-item"
                        role="menuitem"
                        onClick={() => setShopOpen(false)}
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </nav>

            {/* Actions: Theme Switcher + Cart */}
            <div className="header-actions">
              {/* Theme Toggle Button */}
              <button
                className="theme-toggle-btn"
                onClick={toggleTheme}
                aria-label={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
                title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
                id="theme-toggle"
              >
                {theme === 'dark' ? (
                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="theme-icon-sun"
                  >
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                ) : (
                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="theme-icon-moon"
                  >
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                )}
              </button>

              {/* Cart Button */}
              <button
                className="cart-btn"
                onClick={() => setCartOpen(true)}
                aria-label={`Open cart — ${itemCount} items`}
                id="header-cart-btn"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
                {itemCount > 0 && (
                  <span className={`cart-badge ${cartBump ? 'bump' : ''}`}>{itemCount}</span>
                )}
              </button>

              {/* Mobile hamburger */}
              <button
                className="mobile-toggle"
                onClick={() => setMobileOpen((p) => !p)}
                aria-label="Toggle mobile menu"
                aria-expanded={mobileOpen}
              >
                <span className={`bar${mobileOpen ? ' bar-open' : ''}`} />
                <span className={`bar${mobileOpen ? ' bar-open' : ''}`} />
                <span className={`bar${mobileOpen ? ' bar-open' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <nav className="mobile-menu" aria-label="Mobile navigation">
            <Link href="/" className="m-nav-link">
              Home
            </Link>
            <Link href="/shop" className="m-nav-link">
              All Products
            </Link>
            {CATS.map((c) => (
              <Link key={c.slug} href={`/shop?category=${c.slug}`} className="m-nav-link m-nav-sub">
                {c.name}
              </Link>
            ))}
            <div className="mobile-theme-row">
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Theme: <strong>{theme === 'dark' ? 'Dark Luxe' : 'Alabaster Light'}</strong>
              </span>
              <button className="theme-toggle-pill" onClick={toggleTheme}>
                {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
              </button>
            </div>
          </nav>
        )}
      </header>

      <CartDrawer />
    </>
  );
}
