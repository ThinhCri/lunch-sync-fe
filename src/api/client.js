import axios from 'axios';
import { message } from 'antd';
import { parseApiError } from '@/utils/error';
import { useAuthStore } from '@/store/authStore';
import { API_CONFIG } from '@/config';

// Default client
const defaultClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
});

// Request interceptor: gắn JWT từ authStore
const requestInterceptor = (config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

// Response interceptor: xử lý 401 → logout, 5xx → retry 1 lần
let isRetrying = false;

const responseInterceptor = async (error) => {
  const originalRequest = error.config;

  // 401 Unauthorized → logout
  const isAuthEndpoint = originalRequest?.url?.includes('/auth/');
  if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
    originalRequest._retry = true;
    useAuthStore.getState().logout();
    message.error('Phiên hết hạn. Vui lòng đăng nhập lại.');
    window.location.href = '/login';
    return Promise.reject(error);
  }

  // 5xx → retry 1 lần
  if (error.response?.status >= 500 && !originalRequest._retry && !isRetrying) {
    originalRequest._retry = true;
    isRetrying = true;
    try {
      const res = await defaultClient.request(originalRequest);
      isRetrying = false;
      return res;
    } catch (e) {
      isRetrying = false;
      return Promise.reject(parseApiError(e));
    }
  }

  return Promise.reject(parseApiError(error));
};

// Apply interceptors to default client
defaultClient.interceptors.request.use(requestInterceptor, (error) => Promise.reject(error));
defaultClient.interceptors.response.use(
  (response) => response,
  responseInterceptor
);

export default defaultClient;
