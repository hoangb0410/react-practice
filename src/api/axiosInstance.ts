import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import queryString from 'query-string';
import { AUTH_PATH_PREFIX, AUTH_REFRESH_PATH, config } from '@/constants';
import { i18n } from '@/translations';

export const AUTH_LOGOUT_EVENT = 'app:auth-logout';

const emitAuthLogout = () => {
  window.dispatchEvent(new CustomEvent(AUTH_LOGOUT_EVENT));
};

export const apiClient = axios.create({
  baseURL: config.env.VITE_API_URL,
  timeout: 30000,
  withCredentials: true,
  paramsSerializer: (params) =>
    queryString.stringify(params, { skipNull: true, skipEmptyString: true }),
});

apiClient.interceptors.request.use((req) => {
  const lang = i18n.language || 'en';
  req.params = { ...(req.params ?? {}), lang };
  return req;
});

let isRefreshing = false;
type FailedRequest = {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
};
let listFailedRequest: FailedRequest[] = [];

const processQueue = (error: unknown) => {
  listFailedRequest.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(null);
  });
  listFailedRequest = [];
};

apiClient.interceptors.response.use(
  (res) => res.data,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig | undefined;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes(AUTH_PATH_PREFIX)
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          listFailedRequest.push({ resolve, reject });
        })
          .then(() => apiClient(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post(
          `${config.env.VITE_API_URL}${AUTH_REFRESH_PATH}`,
          {},
          { withCredentials: true }
        );
        processQueue(null);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        emitAuthLogout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
