'use client';
import Link from 'next/link';

const SHOP_LINKS = [
  { name: 'Entry Way', slug: 'entryway' },
  { name: 'Living Room', slug: 'living-room' },
  { name: 'Dining Room', slug: 'dining-room' },
  { name: 'Bedroom', slug: 'bedroom' },
  { name: 'Home Office', slug: 'home-office' },
  { name: 'Storage', slug: 'storage' },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <div className="logo">
              <span className="logo-main">Universal</span>
              <span className="logo-sub">Int Studio</span>
            </div>
            <p>
              Furniture crafted to elevate the way you live. Every piece is a statement — designed
              for those who believe home is the highest form of art.
            </p>
          </div>

          {/* Shop */}
          <div className="footer-col">
            <h4>Shop</h4>
            <Link href="/shop">All Products</Link>
            {SHOP_LINKS.map((l) => (
              <Link key={l.slug} href={`/shop?category=${l.slug}`}>
                {l.name}
              </Link>
            ))}
          </div>

          {/* Company */}
          <div className="footer-col">
            <h4>Company</h4>
            <Link href="/">About Us</Link>
            <Link href="/">Showroom</Link>
            <Link href="/">Careers</Link>
            <Link href="/">Press</Link>
          </div>

          {/* Info */}
          <div className="footer-col">
            <h4>Information</h4>
            <Link href="/">Delivery & Returns</Link>
            <Link href="/">Care Guide</Link>
            <Link href="/">Privacy Policy</Link>
            <Link href="/admin" style={{ opacity: 0.4, fontSize: '12px' }}>
              Admin Panel
            </Link>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 Universal Int Studio. All rights reserved.</p>
          <p style={{ fontSize: '12px', opacity: 0.5 }}>Crafted with care · Made to last</p>
        </div>
      </div>
    </footer>
  );
}
