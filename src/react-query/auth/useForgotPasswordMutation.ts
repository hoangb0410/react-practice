import { authApi } from '@/api';
import { IForgotPasswordFormValues } from '@/interfaces';
import { IAppMutationOptions } from '@/types';
import { useMutation } from '@tanstack/react-query';

interface IVariablesType {
  body: IForgotPasswordFormValues;
}

interface IMutationParams {
  configs?: IAppMutationOptions<IVariablesType, void>;
}

export const useForgotPasswordMutation = ({ configs }: IMutationParams = {}) =>
  useMutation({
    mutationFn: (v: IVariablesType) => authApi.forgotPassword(v.body),
    ...configs,
  });
