import { AxiosRequestConfig } from 'axios';
import { IAppResponse } from '@/interfaces';
import { apiClient } from './axiosInstance';

export const axiosService = {
  get: <TRes = unknown, TReq = unknown>(
    url: string,
    config?: AxiosRequestConfig<TReq>
  ): Promise<IAppResponse<TRes>> =>
    apiClient.get(url, config) as unknown as Promise<IAppResponse<TRes>>,

  post: <TRes = unknown, TReq = unknown>(
    url: string,
    body?: TReq,
    config?: AxiosRequestConfig<TReq>
  ): Promise<IAppResponse<TRes>> =>
    apiClient.post(url, body, config) as unknown as Promise<IAppResponse<TRes>>,

  put: <TRes = unknown, TReq = unknown>(
    url: string,
    body?: TReq,
    config?: AxiosRequestConfig<TReq>
  ): Promise<IAppResponse<TRes>> =>
    apiClient.put(url, body, config) as unknown as Promise<IAppResponse<TRes>>,

  patch: <TRes = unknown, TReq = unknown>(
    url: string,
    body?: TReq,
    config?: AxiosRequestConfig<TReq>
  ): Promise<IAppResponse<TRes>> =>
    apiClient.patch(url, body, config) as unknown as Promise<
      IAppResponse<TRes>
    >,

  delete: <TRes = unknown, TReq = unknown>(
    url: string,
    body?: TReq,
    config?: AxiosRequestConfig<TReq>
  ): Promise<IAppResponse<TRes>> =>
    apiClient.delete(url, {
      ...config,
      data: body,
    }) as unknown as Promise<IAppResponse<TRes>>,
};
