'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, slugify, getAdminToken, clearAdminToken, isTokenExpired } from '@/lib/api';

export default function ProductForm({ existingProduct }) {
  const router = useRouter();
  const isEdit = !!existingProduct;

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    sale_price: '',
    category_id: '',
    images: [],
    dimensions: '',
    material: '',
    finish: '',
    is_featured: false,
    in_stock: true,
  });
  const [categories, setCategories] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getCategories().then(setCategories);
    if (existingProduct) {
      setForm({
        name: existingProduct.name || '',
        slug: existingProduct.slug || '',
        description: existingProduct.description || '',
        price: existingProduct.price || '',
        sale_price: existingProduct.sale_price || '',
        category_id: existingProduct.category_id || '',
        images: existingProduct.images || [],
        dimensions: existingProduct.dimensions || '',
        material: existingProduct.material || '',
        finish: existingProduct.finish || '',
        is_featured: !!existingProduct.is_featured,
        in_stock: existingProduct.in_stock !== 0,
      });
    }
  }, [existingProduct]);

  function update(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    if (name === 'name' && !isEdit) {
      setForm((f) => ({ ...f, name: value, slug: slugify(value) }));
    }
  }

  async function uploadImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const token = getAdminToken();
    if (!token || isTokenExpired(token)) {
      clearAdminToken();
      router.push('/admin/login?expired=1');
      return;
    }
    setUploading(true);
    try {
      const { url } = await api.uploadImage(file, token);
      setForm((f) => ({ ...f, images: [...f.images, url] }));
    } catch (err) {
      if (err.status === 401 || err.message?.toLowerCase().includes('unauthorized')) {
        clearAdminToken();
        router.push('/admin/login?expired=1');
        return;
      }
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  function removeImage(idx) {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const token = getAdminToken();
    if (!token || isTokenExpired(token)) {
      clearAdminToken();
      router.push('/admin/login?expired=1');
      return;
    }
    const payload = {
      ...form,
      price: parseFloat(form.price),
      sale_price: form.sale_price ? parseFloat(form.sale_price) : null,
      category_id: form.category_id ? parseInt(form.category_id) : null,
    };
    try {
      if (isEdit) {
        await api.updateProduct(existingProduct.id, payload, token);
      } else {
        await api.createProduct(payload, token);
      }
      router.push('/admin/products');
    } catch (err) {
      if (err.status === 401 || err.message?.toLowerCase().includes('unauthorized')) {
        clearAdminToken();
        router.push('/admin/login?expired=1');
        return;
      }
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} id="product-form">
      <div className="admin-form-card">
        <h2>{isEdit ? `Edit: ${existingProduct.name}` : 'New Product'}</h2>

        {/* Basic Info */}
        <div className="form-section-title">Basic Information</div>
        <div className="form-grid-2" style={{ gap: '20px', marginBottom: '20px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="pf-name">
              Product Name *
            </label>
            <input
              id="pf-name"
              name="name"
              className="input"
              required
              value={form.name}
              onChange={update}
              placeholder="e.g. Oslo Sectional Sofa"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="pf-slug">
              Slug *
            </label>
            <input
              id="pf-slug"
              name="slug"
              className="input"
              required
              value={form.slug}
              onChange={update}
              placeholder="auto-generated from name"
            />
          </div>
        </div>
        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label className="form-label" htmlFor="pf-desc">
            Description
          </label>
          <textarea
            id="pf-desc"
            name="description"
            className="textarea"
            value={form.description}
            onChange={update}
            placeholder="Describe the product..."
          />
        </div>
        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label className="form-label" htmlFor="pf-cat">
            Category
          </label>
          <select
            id="pf-cat"
            name="category_id"
            className="select"
            value={form.category_id}
            onChange={update}
          >
            <option value="">— No category —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Pricing */}
        <div className="form-section-title">Pricing</div>
        <div className="form-grid-2" style={{ gap: '20px', marginBottom: '20px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="pf-price">
              Price (₹) *
            </label>
            <input
              id="pf-price"
              name="price"
              className="input"
              type="number"
              min="0"
              step="0.01"
              required
              value={form.price}
              onChange={update}
              placeholder="e.g. 45000"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="pf-sale">
              Sale Price (₹) — optional
            </label>
            <input
              id="pf-sale"
              name="sale_price"
              className="input"
              type="number"
              min="0"
              step="0.01"
              value={form.sale_price}
              onChange={update}
              placeholder="Leave empty for no sale"
            />
          </div>
        </div>

        {/* Specs */}
        <div className="form-section-title">Specifications</div>
        <div className="form-group" style={{ marginBottom: '16px' }}>
          <label
            className="form-label"
            htmlFor="pf-dims"
            style={{ display: 'flex', justifyContent: 'space-between' }}
          >
            <span>Dimensions</span>
            <span
              style={{
                fontSize: '11px',
                color: 'var(--text-faint)',
                textTransform: 'none',
                fontWeight: 400,
              }}
            >
              e.g. W 120 × D 30 × H 200 cm (Tower Bookcase)
            </span>
          </label>
          <input
            id="pf-dims"
            name="dimensions"
            className="input"
            value={form.dimensions}
            onChange={update}
            title={form.dimensions}
            placeholder="W × D × H cm (e.g. W 120 × D 30 × H 200 cm)"
            style={{ width: '100%', fontSize: '14px' }}
          />
        </div>

        <div className="form-grid-2" style={{ gap: '20px', marginBottom: '20px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="pf-mat">
              Material
            </label>
            <input
              id="pf-mat"
              name="material"
              className="input"
              value={form.material}
              onChange={update}
              title={form.material}
              placeholder="e.g. Powder-coated Steel + Solid Natural Oak"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="pf-finish">
              Finish
            </label>
            <input
              id="pf-finish"
              name="finish"
              className="input"
              value={form.finish}
              onChange={update}
              title={form.finish}
              placeholder="e.g. Matte Black + Natural Oak"
            />
          </div>
        </div>

        {/* Images */}
        <div className="form-section-title">Images</div>
        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label className="form-label" htmlFor="pf-img-upload">
            Upload Image
          </label>
          <input
            id="pf-img-upload"
            type="file"
            accept="image/*"
            onChange={uploadImage}
            disabled={uploading}
            style={{ color: 'var(--text-muted)', fontSize: '13px' }}
          />
          {uploading && (
            <p style={{ fontSize: '12px', color: 'var(--accent)', marginTop: '6px' }}>
              Uploading...
            </p>
          )}
          {form.images.length > 0 && (
            <div className="img-preview">
              {form.images.map((url, i) => (
                <div key={i} className="img-preview-item">
                  <img src={url} alt={`Image ${i + 1}`} />
                  <button type="button" className="img-remove-btn" onClick={() => removeImage(i)}>
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <p style={{ fontSize: '11px', color: 'var(--text-faint)', marginTop: '8px' }}>
            Or paste image URLs directly:
          </p>
          <input
            className="input"
            style={{ marginTop: '6px' }}
            placeholder="https://... (press Enter to add)"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const val = e.target.value.trim();
                if (val) {
                  setForm((f) => ({ ...f, images: [...f.images, val] }));
                  e.target.value = '';
                }
              }
            }}
          />
        </div>

        {/* Flags */}
        <div className="form-section-title">Settings</div>
        <div style={{ display: 'flex', gap: '32px', marginBottom: '32px' }}>
          <label className="toggle-switch">
            <input
              type="checkbox"
              name="is_featured"
              checked={form.is_featured}
              onChange={update}
              id="pf-featured"
            />
            <div className="toggle-track" />
            <span style={{ fontSize: '14px' }}>Featured on homepage</span>
          </label>
          <label className="toggle-switch">
            <input
              type="checkbox"
              name="in_stock"
              checked={form.in_stock}
              onChange={update}
              id="pf-stock"
            />
            <div className="toggle-track" />
            <span style={{ fontSize: '14px' }}>In Stock</span>
          </label>
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

        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="submit" className="btn btn-primary" disabled={saving} id="pf-save">
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Product'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => router.back()}>
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}
