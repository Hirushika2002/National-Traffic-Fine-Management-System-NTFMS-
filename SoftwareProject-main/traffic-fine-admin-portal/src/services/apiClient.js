import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

const apiClient = axios.create({ baseURL, headers: { 'Content-Type': 'application/json' } });

// Plain client (no interceptors) used only for the refresh call itself,
// so a failed refresh can't recursively trigger another refresh attempt.
const refreshClient = axios.create({ baseURL, headers: { 'Content-Type': 'application/json' } });

let refreshPromise = null;

function refreshAccessToken() {
  if (!refreshPromise) {
    const { refreshToken } = useAuthStore.getState();
    refreshPromise = refreshClient
      .post('/auth/refresh', { refreshToken })
      .then(({ data }) => {
        useAuthStore.getState().setSession({ accessToken: data.accessToken });
        return data.accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

apiClient.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    const isAuthRoute = config?.url?.startsWith('/auth/');

    if (response?.status === 401 && !config._retried && !isAuthRoute && useAuthStore.getState().refreshToken) {
      config._retried = true;
      try {
        const accessToken = await refreshAccessToken();
        config.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(config);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    if (response?.status === 401 && (isAuthRoute || !useAuthStore.getState().refreshToken)) {
      useAuthStore.getState().logout();
    }

    return Promise.reject(error);
  },
);

export function extractErrorMessage(error, fallback) {
  return error?.response?.data?.error || fallback;
}

export default apiClient;
