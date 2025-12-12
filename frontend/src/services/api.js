import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://meeting-room-system-backend.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  googleAuthUrl: () => api.get('/auth/google'),
  getMe: () => api.get('/auth/me')
};

// Room APIs
export const roomAPI = {
  getAll: (params) => api.get('/rooms', { params: params || {} }),
  getOne: (id) => api.get(`/rooms/${id}`),
  create: (data) => api.post('/rooms', data),
  update: (id, data) => api.put(`/rooms/${id}`, data),
  delete: (id) => api.delete(`/rooms/${id}`),
  checkAvailability: (params) => api.get('/rooms/check-availability', { params: params || {} })
};

// Meeting APIs
export const meetingAPI = {
  getAll: (params) => api.get('/meetings', { params }),
  getOne: (id) => api.get(`/meetings/${id}`),
  create: (data) => api.post('/meetings', data),
  update: (id, data) => api.put(`/meetings/${id}`, data),
  delete: (id) => api.delete(`/meetings/${id}`),
  uploadMinutes: (id, data) => api.post(`/meetings/${id}/minutes`, data)
};

// User APIs
export const userAPI = {
  getAll: () => api.get('/users')
};

export default api;