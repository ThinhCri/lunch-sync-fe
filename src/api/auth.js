import client from './client';

export const authApi = {
  register: (data) =>
    client.post('/auth/register', {
      email: data.email,
      password: data.password,
      full_name: data.fullName,
    }),
  login: (data) => client.post('/auth/login', data),
  verifyOTP: (data) => client.post('/auth/verify-otp', data),
  resendOTP: (data) => client.post('/auth/resend-otp', data),
};
