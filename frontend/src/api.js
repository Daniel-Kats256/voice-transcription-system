import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000',
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Pass role and userId for basic authorization checks on the server
  const role = localStorage.getItem('role');
  const userId = localStorage.getItem('userId');
  if (role) config.headers['x-role'] = role;
  if (userId) config.headers['x-user-id'] = userId;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timed out. Network may be slow.';
    }
    return Promise.reject(error);
  }
);

export default api;