import {
  RegisterRequest,
  LoginRequest,
  LoginResponse,
  User,
  Product,
  CreateOrderRequest,
  CreateOrderResponse,
  Order,
} from './types';

export async function register(data: RegisterRequest): Promise<User> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Registration failed');
  }
  return res.json();
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Login failed');
  }
  return res.json();
}

export async function logout(): Promise<void> {
  const res = await fetch('/api/auth/logout', { method: 'POST' });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Logout failed');
  }
}

export async function getMe(token: string): Promise<User> {
  const res = await fetch('/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Failed to fetch user');
  }
  return res.json();
}

export async function getCategories(): Promise<Category[]> {
  const res = await fetch('/api/catalog/categories');
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Failed to fetch categories');
  }
  return res.json();
}

export async function getProducts(params: ProductListParams, options?: { signal?: AbortSignal }): Promise<ProductListResponse> {
  const query = new URLSearchParams(params as any).toString();
  const res = await fetch(`/api/catalog/products?${query}`, { signal: options?.signal });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Failed to fetch products');
  }
  return res.json();
}

export async function getProductBySlug(slug: string): Promise<Product> {
  const res = await fetch(`/api/catalog/products/${slug}`);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Failed to fetch product');
  }
  return res.json();
}

export async function getProductsByIds(ids: number[]): Promise<Product[]> {
  const res = await fetch('/api/catalog/products/batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Failed to fetch products');
  }
  return res.json();
}

export async function getPromoBlocks(): Promise<any[]> {
  const res = await fetch('/api/promo');
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Failed to fetch promo');
  }
  return res.json();
}

export async function createOrder(data: CreateOrderRequest, token: string): Promise<CreateOrderResponse> {
  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Order creation failed');
  }
  return res.json();
}

export async function getMyOrders(token: string): Promise<Order[]> {
  const res = await fetch('/api/orders', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Failed to fetch orders');
  }
  return res.json();
}
