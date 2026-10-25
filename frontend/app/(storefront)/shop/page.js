'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/product/ProductCard';
import { api } from '@/lib/api';

const CATS = [
  { name: 'All Products', slug: '' },
  { name: 'Entry Way', slug: 'entryway' },
  { name: 'Living Room', slug: 'living-room' },
  { name: 'Dining Room', slug: 'dining-room' },
  { name: 'Bedroom', slug: 'bedroom' },
  { name: 'Home Office', slug: 'home-office' },
  { name: 'Storage', slug: 'storage' },
];

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('default');

  const activeCategory = searchParams.get('category') || '';

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const params = {};
        if (activeCategory) params.category = activeCategory;
        const data = await api.getProducts(params);
        setProducts(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [activeCategory]);

  function setCategory(slug) {
    if (slug) router.push(`/shop?category=${slug}`);
    else router.push('/shop');
  }

  const filtered = products
    .filter(
      (p) =>
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.material || '').toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sort === 'price-asc') return (a.sale_price || a.price) - (b.sale_price || b.price);
      if (sort === 'price-desc') return (b.sale_price || b.price) - (a.sale_price || a.price);
      return 0;
    });

  const activeCat = CATS.find((c) => c.slug === activeCategory);

  return (
    <div className="page-enter">
      {/* Page Hero */}
      <div className="page-hero">
        <div className="container">
          <p className="page-hero-eyebrow">Universal Int Studio</p>
          <h1>{activeCat?.name || 'Our Collection'}</h1>
          <p>Discover furniture crafted to elevate every room in your home.</p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
        {/* Filter Bar */}
        <div className="filter-bar">
          <div className="filter-chips-scroll">
            {CATS.map((c) => (
              <button
                key={c.slug}
                className={`chip${activeCategory === c.slug ? ' active' : ''}`}
                onClick={() => setCategory(c.slug)}
                id={`filter-${c.slug || 'all'}`}
              >
                {c.name}
              </button>
            ))}
          </div>
          <div className="filter-right">
            <input
              className="input"
              style={{ width: '220px', padding: '8px 14px' }}
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="shop-search"
            />
            <select
              className="sort-select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              id="shop-sort"
            >
              <option value="default">Sort: Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
            <span className="results-count">{filtered.length} items</span>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid-4">
            {[...Array(8)].map((_, i) => (
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
                  <div className="skeleton" style={{ height: '12px', width: '60%' }} />
                  <div className="skeleton" style={{ height: '20px', width: '85%' }} />
                  <div className="skeleton" style={{ height: '16px', width: '40%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <h3>No products found</h3>
            <p>Try a different category or clear your search.</p>
            <button
              className="btn btn-outline"
              onClick={() => {
                setSearch('');
                setCategory('');
              }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid-4">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense>
      <ShopContent />
    </Suspense>
  );
}
