import client from './client';

export const collectionsApi = {
  list: () => client.get('/collections'),
  getById: (id) => client.get(`/collections/${id}`),
};
