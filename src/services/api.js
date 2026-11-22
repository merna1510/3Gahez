import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('userToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function getApiError(error) {
  if (error.code === 'ERR_NETWORK') {
    return 'Cannot connect to the server. Make sure the backend is running.';
  }
  return error.response?.data?.message || error.message || 'Something went wrong';
}

export default api;
