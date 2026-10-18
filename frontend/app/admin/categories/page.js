'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, slugify, getAdminToken, clearAdminToken, isTokenExpired } from '@/lib/api';

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', slug: '', description: '', sort_order: '' });
  const [editing, setEditing] = useState(null); // category id being edited
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      setCategories(await api.getCategories());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function update(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (name === 'name' && !editing) setForm((f) => ({ ...f, name: value, slug: slugify(value) }));
  }

  function startEdit(cat) {
    setEditing(cat.id);
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      sort_order: cat.sort_order || '',
    });
  }

  function cancelEdit() {
    setEditing(null);
    setForm({ name: '', slug: '', description: '', sort_order: '' });
  }

  async function handleSave(e) {
    e.preventDefault();
    const token = getAdminToken();
    if (!token || isTokenExpired(token)) {
      clearAdminToken();
      router.push('/admin/login?expired=1');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await api.updateCategory(editing, form, token);
      } else {
        await api.createCategory(form, token);
      }
      cancelEdit();
      await load();
    } catch (err) {
      if (err.status === 401 || err.message?.toLowerCase().includes('unauthorized')) {
        clearAdminToken();
        router.push('/admin/login?expired=1');
        return;
      }
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id, name) {
    if (!confirm(`Delete category "${name}"? Products in this category will be un-categorised.`))
      return;
    const token = getAdminToken();
    if (!token || isTokenExpired(token)) {
      clearAdminToken();
      router.push('/admin/login?expired=1');
      return;
    }
    try {
      await api.deleteCategory(id, token);
      setCategories((c) => c.filter((x) => x.id !== id));
    } catch (err) {
      if (err.status === 401 || err.message?.toLowerCase().includes('unauthorized')) {
        clearAdminToken();
        router.push('/admin/login?expired=1');
        return;
      }
      alert(err.message);
    }
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 360px',
        gap: '32px',
        alignItems: 'start',
      }}
    >
      {/* Table */}
      <div>
        <div className="admin-table-wrap">
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading...
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Slug</th>
                  <th>Order</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id} id={`cat-row-${cat.id}`}>
                    <td style={{ fontWeight: 500 }}>{cat.name}</td>
                    <td
                      style={{
                        color: 'var(--text-muted)',
                        fontSize: '13px',
                        fontFamily: 'monospace',
                      }}
                    >
                      {cat.slug}
                    </td>
                    <td style={{ color: 'var(--text-faint)', fontSize: '13px' }}>
                      {cat.sort_order}
                    </td>
                    <td>
                      <div className="td-actions">
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => startEdit(cat)}
                          id={`edit-cat-${cat.id}`}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(cat.id, cat.name)}
                          id={`delete-cat-${cat.id}`}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Form */}
      <div className="admin-form-card" style={{ padding: '28px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '24px' }}>
          {editing ? 'Edit Category' : 'Add Category'}
        </h2>
        <form onSubmit={handleSave} id="category-form">
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" htmlFor="cf-name">
              Name *
            </label>
            <input
              id="cf-name"
              name="name"
              className="input"
              required
              value={form.name}
              onChange={update}
              placeholder="e.g. Living Room"
            />
          </div>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" htmlFor="cf-slug">
              Slug *
            </label>
            <input
              id="cf-slug"
              name="slug"
              className="input"
              required
              value={form.slug}
              onChange={update}
              placeholder="e.g. living-room"
            />
          </div>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" htmlFor="cf-desc">
              Description
            </label>
            <textarea
              id="cf-desc"
              name="description"
              className="textarea"
              style={{ minHeight: '80px' }}
              value={form.description}
              onChange={update}
              placeholder="Brief description..."
            />
          </div>
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label" htmlFor="cf-order">
              Sort Order
            </label>
            <input
              id="cf-order"
              name="sort_order"
              className="input"
              type="number"
              value={form.sort_order}
              onChange={update}
              placeholder="1"
            />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={saving}
              id="cat-save"
            >
              {saving ? '...' : editing ? 'Save' : 'Add'}
            </button>
            {editing && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={cancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
