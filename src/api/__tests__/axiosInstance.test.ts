import axios, {
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/constants', () => ({
  config: { env: { VITE_API_URL: 'http://test.local' } },
  AUTH_REFRESH_PATH: '/api/auth/refresh-token',
  AUTH_PATH_PREFIX: '/api/auth/',
}));

vi.mock('@/translations', () => ({
  i18n: { language: 'vi' },
}));

import { apiClient, AUTH_LOGOUT_EVENT } from '../axiosInstance';

type AdapterFn = (
  cfg: InternalAxiosRequestConfig
) => Promise<AxiosResponse<unknown>>;

const buildResponse = (
  cfg: InternalAxiosRequestConfig,
  status: number,
  data: unknown = {}
): AxiosResponse<unknown> => ({
  status,
  statusText: '',
  headers: {},
  config: cfg,
  data,
});

const setAdapter = (impl: AdapterFn) => {
  apiClient.defaults.adapter =
    impl as unknown as typeof apiClient.defaults.adapter;
};

describe('axiosInstance', () => {
  const originalAdapter = apiClient.defaults.adapter;

  beforeEach(() => {
    apiClient.defaults.adapter = originalAdapter;
  });

  afterEach(() => {
    apiClient.defaults.adapter = originalAdapter;
  });

  it('injects lang query param from i18n', async () => {
    let capturedParams: Record<string, unknown> = {};
    setAdapter(async (cfg) => {
      capturedParams = (cfg.params ?? {}) as Record<string, unknown>;
      return buildResponse(cfg, 200, { ok: true });
    });

    await apiClient.get('/api/ping');
    expect(capturedParams).toMatchObject({ lang: 'vi' });
  });

  it('unwraps res.data on success', async () => {
    setAdapter(async (cfg) => buildResponse(cfg, 200, { name: 'hoang' }));

    const data = await apiClient.get('/api/me');
    expect(data).toEqual({ name: 'hoang' });
  });

  it('does NOT auto-refresh on 401 from /api/auth/* endpoints', async () => {
    let refreshCalled = false;
    setAdapter(async (cfg) => {
      if (cfg.url?.includes('refresh-token')) {
        refreshCalled = true;
        return buildResponse(cfg, 200);
      }
      return Promise.reject({
        isAxiosError: true,
        response: buildResponse(cfg, 401),
        config: cfg,
      });
    });

    await expect(
      apiClient.post('/api/auth/login', { email: 'x', password: 'y' })
    ).rejects.toBeDefined();

    expect(refreshCalled).toBe(false);
  });

  it('emits auth-logout event when refresh fails', async () => {
    setAdapter(async (cfg) =>
      Promise.reject({
        isAxiosError: true,
        response: buildResponse(cfg, 401),
        config: cfg,
      })
    );

    // Refresh uses raw axios.post (not apiClient) — stub it to fail fast.
    const postSpy = vi
      .spyOn(axios, 'post')
      .mockRejectedValue(new Error('refresh failed'));

    const listener = vi.fn();
    window.addEventListener(AUTH_LOGOUT_EVENT, listener);

    await expect(apiClient.get('/api/secret')).rejects.toBeDefined();

    expect(listener).toHaveBeenCalled();
    expect(postSpy).toHaveBeenCalledWith(
      expect.stringContaining('refresh-token'),
      expect.anything(),
      expect.objectContaining({ withCredentials: true })
    );

    window.removeEventListener(AUTH_LOGOUT_EVENT, listener);
    postSpy.mockRestore();
  });
});
