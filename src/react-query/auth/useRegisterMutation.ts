import { authApi } from '@/api';
import { IRegisterFormValues, IRegisterResponse } from '@/interfaces';
import { IAppMutationOptions } from '@/types';
import { useMutation } from '@tanstack/react-query';

interface IVariablesType {
  body: IRegisterFormValues;
}

interface IMutationParams {
  configs?: IAppMutationOptions<IVariablesType, IRegisterResponse>;
}

export const useRegisterMutation = ({ configs }: IMutationParams = {}) =>
  useMutation({
    mutationFn: (v: IVariablesType) => authApi.register(v.body),
    ...configs,
  });
