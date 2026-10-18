const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export function getAdminToken() {
  if (typeof window === 'undefined') return null;
  return (
    localStorage.getItem('universal_admin_token') ||
    localStorage.getItem('luxespace_admin_token') ||
    null
  );
}

export function setAdminToken(token) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('universal_admin_token', token);
  localStorage.removeItem('luxespace_admin_token');
}

export function clearAdminToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('universal_admin_token');
  localStorage.removeItem('luxespace_admin_token');
}

export function isTokenExpired(token) {
  if (!token || typeof token !== 'string') return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (!payload.exp) return false;
    return Date.now() >= payload.exp * 1000 - 30000;
  } catch {
    return true;
  }
}

async function request(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    if (res.status === 401 && typeof window !== 'undefined') {
      clearAdminToken();
      if (
        window.location.pathname.startsWith('/admin') &&
        window.location.pathname !== '/admin/login'
      ) {
        window.location.href = '/admin/login?expired=1';
      }
    }
    const error = new Error(err.error || 'Request failed');
    error.status = res.status;
    throw error;
  }
  return res.json();
}

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  // ── Products ──────────────────────────────────────────────────────────
  getProducts: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/products${qs ? '?' + qs : ''}`);
  },
  getProduct: (idOrSlug) => request(`/products/${idOrSlug}`),
  createProduct: (data, token) =>
    request('/products', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: authHeaders(token),
    }),
  updateProduct: (id, data, token) =>
    request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: authHeaders(token),
    }),
  deleteProduct: (id, token) =>
    request(`/products/${id}`, { method: 'DELETE', headers: authHeaders(token) }),

  // ── Categories ────────────────────────────────────────────────────────
  getCategories: () => request('/categories'),
  getCategory: (slug) => request(`/categories/${slug}`),
  createCategory: (data, token) =>
    request('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: authHeaders(token),
    }),
  updateCategory: (id, data, token) =>
    request(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: authHeaders(token),
    }),
  deleteCategory: (id, token) =>
    request(`/categories/${id}`, { method: 'DELETE', headers: authHeaders(token) }),

  // ── Inquiries ─────────────────────────────────────────────────────────
  submitInquiry: (data) => request('/inquiries', { method: 'POST', body: JSON.stringify(data) }),
  getInquiries: (token) => request('/inquiries', { headers: authHeaders(token) }),
  updateInquiry: (id, data, token) =>
    request(`/inquiries/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      headers: authHeaders(token),
    }),

  // ── Auth ──────────────────────────────────────────────────────────────
  login: (credentials) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),

  // ── Upload ────────────────────────────────────────────────────────────
  uploadImage: async (file, token) => {
    const form = new FormData();
    form.append('image', file);
    const res = await fetch(`${API}/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    if (!res.ok) {
      if (res.status === 401 && typeof window !== 'undefined') {
        clearAdminToken();
        if (
          window.location.pathname.startsWith('/admin') &&
          window.location.pathname !== '/admin/login'
        ) {
          window.location.href = '/admin/login?expired=1';
        }
      }
      const err = await res.json().catch(() => ({ error: 'Upload failed' }));
      const error = new Error(err.error || 'Upload failed');
      error.status = res.status;
      throw error;
    }
    return res.json();
  },
};

export function formatPrice(price) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
}

export function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
