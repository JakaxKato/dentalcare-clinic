import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('dc_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      const path = window.location.pathname;
      if (!path.startsWith('/login') && !path.startsWith('/register')) {
        localStorage.removeItem('dc_token');
        localStorage.removeItem('dc_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export const extractMessage = (err, fallback = 'Terjadi kesalahan') =>
  (err && err.response && err.response.data && err.response.data.message) || (err && err.message) || fallback;

export default api;
