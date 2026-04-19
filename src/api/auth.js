import client from './client';

export const authApi = {
  login: (email, password) =>
    client.post('/auth/login', { email, password }),

  register: (email, password, fullName) =>
    client.post('/auth/register', { email, password, full_name: fullName }),

  logout: () => client.post('/auth/logout'),

  refresh: (refresh_token) =>
    client.post('/auth/refresh', { refresh_token }),

  getMe: () => client.get('/auth/me'),

  verifyOTP: ({ email, otp }) => client.post('/auth/verify-otp', { email, otp }),
  resendOTP: ({ email }) => client.post('/auth/resend-otp', { email }),
};
