'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, formatPrice, getAdminToken, clearAdminToken, isTokenExpired } from '@/lib/api';

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const [prods, cats] = await Promise.all([
        api.getProducts(),
        api.getCategories().catch(() => []),
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id, name) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const token = getAdminToken();
    if (!token || isTokenExpired(token)) {
      clearAdminToken();
      router.push('/admin/login?expired=1');
      return;
    }
    setDeleting(id);
    try {
      await api.deleteProduct(id, token);
      setProducts((p) => p.filter((x) => x.id !== id));
    } catch (e) {
      if (e.status === 401 || e.message?.toLowerCase().includes('unauthorized')) {
        clearAdminToken();
        router.push('/admin/login?expired=1');
        return;
      }
      alert('Failed to delete: ' + e.message);
    } finally {
      setDeleting(null);
    }
  }

  const filtered = products
    .filter((p) => {
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.slug || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.category_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.material || '').toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        !selectedCategory ||
        p.category_slug === selectedCategory ||
        (p.category_id && String(p.category_id) === String(selectedCategory));

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      const priceA = a.sale_price && a.sale_price < a.price ? a.sale_price : a.price;
      const priceB = b.sale_price && b.sale_price < b.price ? b.sale_price : b.price;

      if (sortBy === 'price-asc') return priceA - priceB;
      if (sortBy === 'price-desc') return priceB - priceA;
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
      if (sortBy === 'newest') return (b.id || 0) - (a.id || 0);

      // Default: featured first, then newest
      if (b.is_featured !== a.is_featured) return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
      return (b.id || 0) - (a.id || 0);
    });

  return (
    <div>
      {/* Top Filter & Action Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            className="input"
            style={{ width: '220px', height: '40px', padding: '0 14px' }}
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="admin-products-search"
          />

          <select
            className="select"
            style={{ width: '170px', height: '40px', padding: '0 12px' }}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            id="admin-products-category-filter"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.slug || c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            className="select"
            style={{ width: '180px', height: '40px', padding: '0 12px' }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            id="admin-products-sort"
          >
            <option value="featured">Sort: Featured First</option>
            <option value="price-asc">Sort: Price: Low to High</option>
            <option value="price-desc">Sort: Price: High to Low</option>
            <option value="name-asc">Sort: Name: A to Z</option>
            <option value="name-desc">Sort: Name: Z to A</option>
            <option value="newest">Sort: Newest First</option>
          </select>

          {(search || selectedCategory || sortBy !== 'featured') && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setSelectedCategory('');
                setSortBy('featured');
              }}
              style={{
                fontSize: '12px',
                color: 'var(--accent)',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                background: 'var(--surface-2)',
                cursor: 'pointer',
              }}
            >
              Reset
            </button>
          )}

          <span style={{ fontSize: '13px', color: 'var(--text-faint)' }}>
            {filtered.length} of {products.length} products
          </span>
        </div>

        <Link href="/admin/products/new" className="btn btn-primary" id="admin-add-product">
          + Add Product
        </Link>
      </div>

      {/* Category Surfing Chips Row */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      >
        <button
          type="button"
          className={`chip${selectedCategory === '' ? ' active' : ''}`}
          onClick={() => setSelectedCategory('')}
          style={{ padding: '6px 14px', fontSize: '12px' }}
        >
          All ({products.length})
        </button>
        {categories.map((c) => {
          const count = products.filter((p) => p.category_slug === c.slug).length;
          return (
            <button
              key={c.slug || c.id}
              type="button"
              className={`chip${selectedCategory === c.slug ? ' active' : ''}`}
              onClick={() => setSelectedCategory(selectedCategory === c.slug ? '' : c.slug)}
              style={{ padding: '6px 14px', fontSize: '12px' }}
            >
              {c.name} {count > 0 && `(${count})`}
            </button>
          );
        })}
      </div>

      <div className="admin-table-wrap">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            {search ? 'No products match your search.' : 'No products yet.'}
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '64px' }}>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Featured</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const hasSale = p.sale_price && p.sale_price < p.price;
                return (
                  <tr key={p.id} id={`product-row-${p.id}`}>
                    <td>
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt={p.name} className="thumb" />
                      ) : (
                        <div
                          className="thumb"
                          style={{
                            background: 'var(--surface-3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <span style={{ fontSize: '20px', opacity: 0.3 }}>⊞</span>
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, marginBottom: '2px' }}>{p.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-faint)' }}>{p.slug}</div>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                      {p.category_name || '—'}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>
                        {formatPrice(hasSale ? p.sale_price : p.price)}
                      </div>
                      {hasSale && (
                        <div
                          style={{
                            fontSize: '12px',
                            color: 'var(--text-faint)',
                            textDecoration: 'line-through',
                          }}
                        >
                          {formatPrice(p.price)}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={`badge badge-${p.is_featured ? 'accent' : 'muted'}`}>
                        {p.is_featured ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${p.in_stock ? 'success' : 'danger'}`}>
                        {p.in_stock ? 'In Stock' : 'Out'}
                      </span>
                    </td>
                    <td>
                      <div className="td-actions">
                        <Link
                          href={`/admin/products/${p.id}`}
                          className="btn btn-ghost btn-sm"
                          id={`edit-product-${p.id}`}
                        >
                          Edit
                        </Link>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(p.id, p.name)}
                          disabled={deleting === p.id}
                          id={`delete-product-${p.id}`}
                        >
                          {deleting === p.id ? '...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
