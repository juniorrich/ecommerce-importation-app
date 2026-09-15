import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('token');
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth
export const register = (data: { name: string; email: string; password: string; phone?: string }) =>
  api.post('/auth/register', data);

export const login = (data: { email: string; password: string }) =>
  api.post('/auth/login', data);

export const getMe = () => api.get('/auth/me');

// Products
export const getProducts = (params?: Record<string, any>) =>
  api.get('/products', { params });

export const getProduct = (id: string) => api.get(`/products/${id}`);

export const getCategories = () => api.get('/products/categories/list');

export const createProduct = (formData: FormData) =>
  api.post('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const updateProduct = (id: string, formData: FormData) =>
  api.put(`/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteProduct = (id: string) => api.delete(`/products/${id}`);

// Cart
export const getCart = () => api.get('/cart');
export const addToCart = (productId: string, quantity = 1) =>
  api.post('/cart', { productId, quantity });
export const updateCartItem = (productId: string, quantity: number) =>
  api.put(`/cart/${productId}`, { quantity });
export const removeFromCart = (productId: string) => api.delete(`/cart/${productId}`);
export const clearCart = () => api.delete('/cart');

// Orders
export const createOrder = (data: any) => api.post('/orders', data);
export const getMyOrders = () => api.get('/orders/myorders');
export const getOrder = (id: string) => api.get(`/orders/${id}`);
export const getOrders = () => api.get('/orders'); // Admin
export const updateOrderStatus = (id: string, data: { status: string; trackingNumber?: string }) =>
  api.put(`/orders/${id}/status`, data);
export const updateOrderToPaid = (id: string, data: any) =>
  api.put(`/orders/${id}/pay`, data);

// Payments
export const initializePayment = (data: { orderId: string; email: string; amount: number }) =>
  api.post('/payments/initialize', data);
export const verifyPayment = (reference: string) =>
  api.get(`/payments/verify/${reference}`);

// Admin - Users
export const getUsers = (params?: Record<string, any>) => api.get('/users', { params });
export const updateUser = (id: string, data: any) => api.put(`/users/${id}`, data);
export const deleteUser = (id: string) => api.delete(`/users/${id}`);

// Admin - Reports
export const getDashboardStats = () => api.get('/admin/reports/dashboard');
export const getSalesReport = (params?: Record<string, any>) =>
  api.get('/admin/reports/sales', { params });
export const getInventoryReport = () => api.get('/admin/reports/inventory');
