import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle expired token globally
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err.response?.data || err);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  refresh: () => api.post('/auth/refresh'),
};

// Expenses
export const expenseAPI = {
  getAll: (params) => api.get('/expenses', { params }),
  create: (data) => api.post('/expenses', data),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`),
  getSummary: (params) => api.get('/expenses/summary', { params }),
};

// Budgets
export const budgetAPI = {
  get: (params) => api.get('/budgets', { params }),
  set: (data) => api.post('/budgets', data),
};

// Bills
export const billAPI = {
  getAll: () => api.get('/bills'),
  create: (data) => api.post('/bills', data),
  update: (id, data) => api.put(`/bills/${id}`, data),
  markPaid: (id) => api.patch(`/bills/${id}/pay`),
  delete: (id) => api.delete(`/bills/${id}`),
};

// Analytics
export const analyticsAPI = {
  getOverview: (params) => api.get('/analytics/overview', { params }),
  getTrend: () => api.get('/analytics/trend'),
  getWeekly: () => api.get('/analytics/weekly'),
  getInsights: () => api.get('/analytics/ai-insights'),
};

// Reports
export const reportAPI = {
  getMonthly: (params) => api.get('/reports/monthly', { params }),
  downloadPDF: (params) => api.get('/reports/monthly/pdf', { params, responseType: 'blob' }),
};

// AI
export const aiAPI = {
  categorize: (data) => api.post('/ai/categorize', data),
  predict: () => api.get('/ai/predict'),
  getBudgetSuggestions: () => api.get('/ai/budget-suggestion'),
};

// Users
export const userAPI = {
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.put('/users/password', data),
};

export default api;
