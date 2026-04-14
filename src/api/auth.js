import client from './client';

export const authApi = {
  register: (data) => client.post('/auth/register', data),
  login: (data) => client.post('/auth/login', data),
  verifyOTP: (data) => client.post('/auth/verify-otp', data),
  resendOTP: (data) => client.post('/auth/resend-otp', data),
};
