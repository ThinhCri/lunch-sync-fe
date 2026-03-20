import client from './client';

export const submissionsApi = {
  create: (data) => client.post('/submissions', data),
  list: () => client.get('/admin/submissions'),
  review: (id, data) => client.post(`/admin/submissions/${id}/review`, data),
};

export const dishesApi = {
  list: () => client.get('/admin/dishes'),
  getById: (id) => client.get(`/admin/dishes/${id}`),
  updateProfile: (id, data) => client.put(`/admin/dishes/${id}/profile`, data),
  upload: (data) => client.post('/admin/dishes/upload', data),
  export: () => client.get('/admin/dishes/export'),
  reloadCache: () => client.post('/admin/dishes/cache/reload'),
};
