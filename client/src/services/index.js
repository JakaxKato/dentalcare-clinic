import api from './api';

export const authService = {
  login: (data) => api.post('/auth/login', data).then((r) => r.data.data),
  register: (data) => api.post('/auth/register', data).then((r) => r.data.data),
  me: () => api.get('/auth/me').then((r) => r.data.data),
};

export const dentistService = {
  list: () => api.get('/dentists').then((r) => r.data.data),
  get: (id) => api.get(`/dentists/${id}`).then((r) => r.data.data),
  create: (data) => api.post('/dentists', data).then((r) => r.data.data),
  update: (id, data) => api.put(`/dentists/${id}`, data).then((r) => r.data.data),
  remove: (id) => api.delete(`/dentists/${id}`).then((r) => r.data),
};

export const serviceService = {
  list: (activeOnly = false) =>
    api.get('/services', { params: activeOnly ? { activeOnly: true } : {} }).then((r) => r.data.data),
  getBySlug: (slug) => api.get(`/services/${slug}`).then((r) => r.data.data),
  create: (data) => api.post('/services', data).then((r) => r.data.data),
  update: (id, data) => api.put(`/services/${id}`, data).then((r) => r.data.data),
  remove: (id) => api.delete(`/services/${id}`).then((r) => r.data),
};

export const appointmentService = {
  create: (data) => api.post('/appointments', data).then((r) => r.data.data),
  list: (params = {}) => api.get('/appointments', { params }).then((r) => r.data.data),
  mine: () => api.get('/appointments/my-appointments').then((r) => r.data.data),
  get: (id) => api.get(`/appointments/${id}`).then((r) => r.data.data),
  updateStatus: (id, data) => api.put(`/appointments/${id}/status`, data).then((r) => r.data.data),
  reschedule: (id, data) => api.put(`/appointments/${id}/reschedule`, data).then((r) => r.data.data),
  remove: (id) => api.delete(`/appointments/${id}`).then((r) => r.data),
  stats: () => api.get('/appointments/stats').then((r) => r.data.data),
};

export const articleService = {
  list: (params = {}) => api.get('/articles', { params }).then((r) => r.data.data),
  getBySlug: (slug) => api.get(`/articles/${slug}`).then((r) => r.data.data),
  create: (data) => api.post('/articles', data).then((r) => r.data.data),
  update: (id, data) => api.put(`/articles/${id}`, data).then((r) => r.data.data),
  remove: (id) => api.delete(`/articles/${id}`).then((r) => r.data),
};

export const testimonialService = {
  list: () => api.get('/testimonials').then((r) => r.data.data),
  create: (data) => api.post('/testimonials', data).then((r) => r.data.data),
  approve: (id, isApproved = true) =>
    api.put(`/testimonials/${id}/approve`, { isApproved }).then((r) => r.data.data),
  remove: (id) => api.delete(`/testimonials/${id}`).then((r) => r.data),
};

export const userService = {
  list: (params = {}) => api.get('/users', { params }).then((r) => r.data.data),
  get: (id) => api.get(`/users/${id}`).then((r) => r.data.data),
  update: (id, data) => api.put(`/users/${id}`, data).then((r) => r.data.data),
  remove: (id) => api.delete(`/users/${id}`).then((r) => r.data),
};
