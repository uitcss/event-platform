import axios from 'axios';
import { useAuth } from './Context/adminAuthContext';

// Create a custom axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:4000/api', // Your backend API base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      const { logout } = useAuth();
      logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
