import { authApi } from '@/api';
import { IResetPasswordBody } from '@/interfaces';
import { IAppMutationOptions } from '@/types';
import { useMutation } from '@tanstack/react-query';

interface IVariablesType {
  body: IResetPasswordBody;
}

interface IMutationParams {
  configs?: IAppMutationOptions<IVariablesType, void>;
}

export const useResetPasswordMutation = ({ configs }: IMutationParams = {}) =>
  useMutation({
    mutationFn: (v: IVariablesType) => authApi.resetPassword(v.body),
    ...configs,
  });
