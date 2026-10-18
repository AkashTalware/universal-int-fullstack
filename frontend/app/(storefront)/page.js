'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';
import { api, formatPrice } from '@/lib/api';

const CATS = [
  { name: 'All', slug: '' },
  { name: 'Entry Way', slug: 'entryway' },
  { name: 'Living Room', slug: 'living-room' },
  { name: 'Dining Room', slug: 'dining-room' },
  { name: 'Bedroom', slug: 'bedroom' },
  { name: 'Home Office', slug: 'home-office' },
  { name: 'Storage', slug: 'storage' },
];

const CAT_GRADIENTS = {
  entryway: 'linear-gradient(135deg, #1a120b 0%, #2d1f14 100%)',
  'living-room': 'linear-gradient(135deg, #0c1a12 0%, #142d1e 100%)',
  'dining-room': 'linear-gradient(135deg, #1a0d0d 0%, #2d1415 100%)',
  bedroom: 'linear-gradient(135deg, #0d0d1a 0%, #14152d 100%)',
  'home-office': 'linear-gradient(135deg, #090f0f 0%, #111d1d 100%)',
  storage: 'linear-gradient(135deg, #0f0f0f 0%, #1c1c1c 100%)',
};

const CAT_ICONS = {
  entryway: '🚪',
  'living-room': '🛋️',
  'dining-room': '🍽️',
  bedroom: '🛏️',
  'home-office': '💻',
  storage: '📦',
};

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [catCounts, setCatCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [featuredData, catsData, allProducts] = await Promise.all([
          api.getProducts({ featured: 'true' }),
          api.getCategories(),
          api.getProducts(),
        ]);
        setFeatured(featuredData);
        setCategories(catsData);
        const counts = {};
        allProducts.forEach((p) => {
          if (p.category_slug) counts[p.category_slug] = (counts[p.category_slug] || 0) + 1;
        });
        setCatCounts(counts);
      } catch (e) {
        console.error('Failed to load home data:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="page-enter">
      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-eyebrow">
              <span>Modern Furniture</span>
            </div>
            <h1 className="hero-title">
              Crafted for
              <br />
              <em>How You Live</em>
            </h1>
            <p className="hero-sub">
              Furniture that doesn't just fill a room — it defines it. Discover premium pieces
              designed to last a lifetime and tell your story.
            </p>
            <div className="hero-actions">
              <Link href="/shop" className="btn btn-primary btn-lg" id="hero-cta-shop">
                Explore Collection
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
              <Link href="/checkout" className="btn btn-outline btn-lg" id="hero-cta-consult">
                Get a Quote
              </Link>
            </div>
          </div>
        </div>
        <div className="hero-scroll" aria-hidden="true">
          <span>Scroll</span>
          <div className="scroll-arrow" />
        </div>
      </section>

      {/* ─── CATEGORIES ───────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '52px' }}>
            <p
              style={{
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color: 'var(--accent)',
                marginBottom: '12px',
              }}
            >
              Our Collections
            </p>
            <h2 className="h2">Shop by Room</h2>
            <p
              style={{
                color: 'var(--text-muted)',
                marginTop: '12px',
                maxWidth: '480px',
                margin: '12px auto 0',
              }}
            >
              Every room deserves furniture that feels like it was made for it.
            </p>
          </div>

          <div className="categories-grid">
            {(categories.length > 0 ? categories : CATS.slice(1)).map((cat, i) => (
              <Link
                key={cat.slug}
                href={`/shop?category=${cat.slug}`}
                className="cat-card"
                id={`cat-card-${cat.slug}`}
              >
                <div
                  className="cat-bg"
                  style={{ background: CAT_GRADIENTS[cat.slug] || 'var(--surface-2)' }}
                />
                <div className="cat-overlay" />
                <div className="cat-content">
                  <p className="cat-num">0{i + 1}</p>
                  <h3 className="cat-name">{cat.name}</h3>
                  <p className="cat-count">
                    {catCounts[cat.slug] ? `${catCounts[cat.slug]} pieces` : 'View collection'}
                  </p>
                  <div className="cat-explore">
                    Explore
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURED PRODUCTS ────────────────────────────────── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-header">
            <div>
              <p
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.25em',
                  textTransform: 'uppercase',
                  color: 'var(--accent)',
                  marginBottom: '10px',
                }}
              >
                Handpicked
              </p>
              <h2 className="h2">Featured Collection</h2>
            </div>
            <Link href="/shop" className="btn btn-ghost">
              View All
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
          </div>

          {loading ? (
            <div className="grid-4">
              {[...Array(4)].map((_, i) => (
                <div key={i}>
                  <div
                    className="skeleton"
                    style={{ aspectRatio: '4/3', borderRadius: 'var(--radius)' }}
                  />
                  <div
                    style={{
                      padding: '20px 0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}
                  >
                    <div className="skeleton" style={{ height: '14px', width: '60%' }} />
                    <div className="skeleton" style={{ height: '20px', width: '85%' }} />
                    <div className="skeleton" style={{ height: '16px', width: '40%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid-4">
              {featured.slice(0, 8).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── BRAND STORY ──────────────────────────────────────── */}
      <section className="section brand-section">
        <div className="container">
          <div className="brand-inner">
            <div>
              <p
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.25em',
                  textTransform: 'uppercase',
                  color: 'var(--accent)',
                  marginBottom: '16px',
                }}
              >
                Our Philosophy
              </p>
              <h2 className="h2" style={{ marginBottom: '24px' }}>
                Furniture that
                <br />
                <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>tells your story</em>
              </h2>
              <p
                style={{
                  fontSize: '16px',
                  color: 'var(--text-muted)',
                  lineHeight: 1.8,
                  marginBottom: '16px',
                }}
              >
                We believe a home is the highest form of self-expression. Every piece in our
                collection is chosen or crafted to age beautifully — gaining character, not losing
                it.
              </p>
              <p
                style={{
                  fontSize: '16px',
                  color: 'var(--text-muted)',
                  lineHeight: 1.8,
                  marginBottom: '36px',
                }}
              >
                From solid walnut consoles to hand-woven seagrass baskets, we curate furniture that
                brings warmth, functionality and enduring elegance to every corner of your home.
              </p>
              <div style={{ display: 'flex', gap: '40px' }}>
                {[
                  ['500+', 'Products'],
                  ['12+', 'Years'],
                  ['100%', 'Satisfaction'],
                ].map(([val, label]) => (
                  <div key={label}>
                    <div
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '32px',
                        fontWeight: 700,
                        color: 'var(--accent)',
                      }}
                    >
                      {val}
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: 'var(--text-faint)',
                        marginTop: '4px',
                      }}
                    >
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="brand-graphic">
              <span className="brand-monogram">UIS</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ───────────────────────────────────────── */}
      <section className="section-sm">
        <div className="container" style={{ textAlign: 'center' }}>
          <p
            style={{
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              marginBottom: '16px',
            }}
          >
            Let's Talk
          </p>
          <h2 className="h2" style={{ marginBottom: '16px' }}>
            Found something you love?
          </h2>
          <p
            style={{
              color: 'var(--text-muted)',
              marginBottom: '32px',
              fontSize: '16px',
              maxWidth: '460px',
              margin: '0 auto 32px',
            }}
          >
            Add items to your cart and send us an inquiry — our team will reach out with a
            personalised quote within 24 hours.
          </p>
          <Link href="/shop" className="btn btn-primary btn-lg" id="bottom-cta">
            Browse Collection
          </Link>
        </div>
      </section>
    </div>
  );
}
