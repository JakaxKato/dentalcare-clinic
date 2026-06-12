import api from './api';

export const authService = {
  login: (data) => api.post('/auth/login', data).then((r) => r.data.data),
  register: (data) => api.post('/auth/register', data).then((r) => r.data.data),
  me: () => api.get('/auth/me').then((r) => r.data.data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }).then((r) => r.data),
  resetPassword: (token, password) =>
    api.post(`/auth/reset-password/${token}`, { password }).then((r) => r.data),
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
  availability: (params) =>
    api.get('/appointments/availability', { params }).then((r) => r.data.data),
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
  mine: () => api.get('/testimonials/my-testimonials').then((r) => r.data.data),
  create: (data) => api.post('/testimonials', data).then((r) => r.data.data),
  approve: (id, isApproved = true) =>
    api.put(`/testimonials/${id}/approve`, { isApproved }).then((r) => r.data.data),
  remove: (id) => api.delete(`/testimonials/${id}`).then((r) => r.data),
};

export const userService = {
  list: (params = {}) => api.get('/users', { params }).then((r) => r.data.data),
  get: (id) => api.get(`/users/${id}`).then((r) => r.data.data),
  update: (id, data) => api.put(`/users/${id}`, data).then((r) => r.data.data),
  updateMedicalHistory: (id, data) =>
    api.put(`/users/${id}/medical-history`, data).then((r) => r.data.data),
  remove: (id) => api.delete(`/users/${id}`).then((r) => r.data),
};

export const odontogramService = {
  forAppointment: (id) => api.get(`/appointments/${id}`).then((r) => r.data.data.odontogram || []),
  updateForAppointment: (id, odontogram) =>
    api.put(`/appointments/${id}/odontogram`, { odontogram }).then((r) => r.data.data),
  forPatient: (patientId) =>
    api.get(`/appointments/patient/${patientId}/odontogram`).then((r) => r.data.data),
};

export const prescriptionService = {
  create: (data) => api.post('/prescriptions', data).then((r) => r.data.data),
  list: (params = {}) => api.get('/prescriptions', { params }).then((r) => r.data.data),
  get: (id) => api.get(`/prescriptions/${id}`).then((r) => r.data.data),
  update: (id, data) => api.put(`/prescriptions/${id}`, data).then((r) => r.data.data),
  remove: (id) => api.delete(`/prescriptions/${id}`).then((r) => r.data),
};

export const paymentService = {
  getDpStatus: (appointmentId) =>
    api.get(`/payments/appointment/${appointmentId}/dp`).then((r) => r.data.data),
  createDp: (appointmentId) =>
    api.post(`/payments/appointment/${appointmentId}/dp`).then((r) => r.data.data),
  confirmDpDev: (appointmentId) =>
    api.post(`/payments/appointment/${appointmentId}/dp/confirm`).then((r) => r.data.data),
};

export const clinicSettingsService = {
  get: () => api.get('/clinic-settings').then((r) => r.data.data),
  update: (data) => api.put('/clinic-settings', data).then((r) => r.data.data),
};

export const invoiceService = {
  create: (data) => api.post('/invoices', data).then((r) => r.data.data),
  list: (params = {}) => api.get('/invoices', { params }).then((r) => r.data.data),
  get: (id) => api.get(`/invoices/${id}`).then((r) => r.data.data),
  update: (id, data) => api.put(`/invoices/${id}`, data).then((r) => r.data.data),
  updatePayment: (id, data) =>
    api.put(`/invoices/${id}/payment`, data).then((r) => r.data.data),
  remove: (id) => api.delete(`/invoices/${id}`).then((r) => r.data),
  downloadPdf: async (id, filename = 'invoice.pdf') => {
    const res = await api.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => window.URL.revokeObjectURL(url), 1000);
  },
};
