import axios from 'axios';
import { message } from 'antd';
import { parseApiError } from '@/utils/error';
import { useAuthStore } from '@/store/authStore';

const client = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// Request interceptor: gắn JWT từ authStore
client.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: xử lý 401 → logout, 5xx → retry 1 lần
let isRetrying = false;

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 Unauthorized → logout
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      useAuthStore.getState().logout();
      message.error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // 5xx → retry 1 lần
    if (error.response?.status >= 500 && !originalRequest._retry && !isRetrying) {
      originalRequest._retry = true;
      isRetrying = true;
      try {
        const res = await client.request(originalRequest);
        isRetrying = false;
        return res;
      } catch (e) {
        isRetrying = false;
        return Promise.reject(parseApiError(e));
      }
    }

    return Promise.reject(parseApiError(error));
  }
);

export default client;
