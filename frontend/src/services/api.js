import axios from 'axios';

// Hardcode backend URL to prevent Vercel environment variable issues
const RAILWAY_URL = 'https://absen-kkn-production.up.railway.app/api';

const api = axios.create({
  baseURL: RAILWAY_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor — attach Bearer token
api.interceptors.request.use(
  (config) => {
    const tokenKey = window.location.pathname.startsWith('/admin') ? 'admin_token' : 'token';
    const token = localStorage.getItem(tokenKey);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const tokenKey = window.location.pathname.startsWith('/admin') ? 'admin_token' : 'token';
      localStorage.removeItem(tokenKey);
      localStorage.removeItem('user');
      // Avoid redirect loop
      if (
        !window.location.pathname.includes('/login') &&
        !window.location.pathname.includes('/register')
      ) {
        if (window.location.pathname.startsWith('/admin')) {
          window.location.href = '/admin/login';
        } else {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
