import axios from 'axios';

// Auto-fix common URL mistakes (http instead of https, or trailing slashes)
let baseUrl = import.meta.env.VITE_API_URL || '/api';
if (baseUrl.startsWith('http://') && !baseUrl.includes('localhost') && !baseUrl.includes('127.0.0.1')) {
  baseUrl = baseUrl.replace('http://', 'https://');
}
if (baseUrl.endsWith('/')) {
  baseUrl = baseUrl.slice(0, -1); // Remove trailing slash to prevent /api//register 301 redirects
}

const api = axios.create({
  baseURL: baseUrl,
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
