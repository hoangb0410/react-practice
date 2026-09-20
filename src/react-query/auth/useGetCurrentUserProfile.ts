import { authApi } from '@/api';
import { IAppResponse, IUserInfo } from '@/interfaces';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useMemo } from 'react';

export const QK_GET_USER_PROFILE = 'QK_GET_USER_PROFILE';

interface IQueryParams {
  configs?: Partial<UseQueryOptions<IAppResponse<IUserInfo>, AxiosError>>;
}

export const useGetCurrentUserProfile = ({ configs }: IQueryParams = {}) => {
  const { data, isFetching, isSuccess, isError, error } = useQuery<
    IAppResponse<IUserInfo>,
    AxiosError
  >({
    queryKey: [QK_GET_USER_PROFILE],
    queryFn: () => authApi.getCurrentUserProfile(),
    retry: false,
    refetchOnWindowFocus: false,
    ...configs,
  });

  const userInfo = useMemo(() => data?.data ?? null, [data]);
  return { userInfo, isFetching, isSuccess, isError, error };
};
