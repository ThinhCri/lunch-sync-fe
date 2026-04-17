import client from './client';

const normalizeUser = (data) => ({
  accessToken: data.access_token,
  userId: data.user_id,
  email: data.email,
  fullName: data.full_name,
  role: data.role,
});

export const authApi = {
  register: (data) =>
    client.post('/auth/register', {
      email: data.email,
      password: data.password,
      full_name: data.fullName,
    }),
  login: async (data) => {
    const res = await client.post('/auth/login', data);
    return { data: normalizeUser(res.data) };
  },
  verifyOTP: (data) => client.post('/auth/verify-otp', data),
  resendOTP: (data) => client.post('/auth/resend-otp', data),
};
