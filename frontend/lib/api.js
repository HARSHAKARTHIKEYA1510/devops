const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

const request = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

// Auth
export const authApi = {
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request('/auth/me'),
  updateProfile: (body) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),
  changePassword: (body) => request('/auth/password', { method: 'PUT', body: JSON.stringify(body) }),
  addAddress: (body) => request('/auth/address', { method: 'POST', body: JSON.stringify(body) }),
  deleteAddress: (id) => request(`/auth/address/${id}`, { method: 'DELETE' }),
  toggleWishlist: (productId) => request(`/auth/wishlist/${productId}`, { method: 'POST' }),
  getWishlist: () => request('/auth/wishlist'),
};

// Products
export const productsApi = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/products${qs ? `?${qs}` : ''}`);
  },
  getOne: (id) => request(`/products/${id}`),
  getFeatured: () => request('/products/featured'),
  getCategories: () => request('/products/categories'),
  create: (body) => request('/products', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id) => request(`/products/${id}`, { method: 'DELETE' }),
  addReview: (id, body) => request(`/products/${id}/reviews`, { method: 'POST', body: JSON.stringify(body) }),
  deleteReview: (id, reviewId) => request(`/products/${id}/reviews/${reviewId}`, { method: 'DELETE' }),
};

// Orders
export const ordersApi = {
  create: (body) => request('/orders', { method: 'POST', body: JSON.stringify(body) }),
  getMyOrders: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/orders/my${qs ? `?${qs}` : ''}`);
  },
  getOne: (id) => request(`/orders/${id}`),
  cancel: (id, body) => request(`/orders/${id}/cancel`, { method: 'PUT', body: JSON.stringify(body) }),
  // Admin
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/orders/admin/all${qs ? `?${qs}` : ''}`);
  },
  updateStatus: (id, body) => request(`/orders/admin/${id}/status`, { method: 'PUT', body: JSON.stringify(body) }),
  getStats: () => request('/orders/admin/stats'),
};

// Coupons
export const couponsApi = {
  validate: (body) => request('/coupons/validate', { method: 'POST', body: JSON.stringify(body) }),
  getAll: () => request('/coupons'),
  create: (body) => request('/coupons', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => request(`/coupons/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id) => request(`/coupons/${id}`, { method: 'DELETE' }),
};
