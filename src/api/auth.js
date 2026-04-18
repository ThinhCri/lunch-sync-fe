import client from './client';

export const authApi = {
  callback: (code) =>
    client.post('/auth/callback', null, { params: { code } }),

  refresh: (refresh_token) =>
    client.post('/auth/refresh', { refresh_token }),

  revoke: (refresh_token) =>
    client.post('/auth/revoke', { refresh_token }),

  getMe: () => client.get('/auth/me'),
};
