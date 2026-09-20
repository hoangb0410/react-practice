import { authApi } from '@/api';
import { ISignInFormValues, ISignInResponse } from '@/interfaces';
import { IAppMutationOptions } from '@/types';
import { useMutation } from '@tanstack/react-query';

interface IVariablesType {
  body: ISignInFormValues;
}

interface IMutationParams {
  configs?: IAppMutationOptions<IVariablesType, ISignInResponse>;
}

export const useLoginMutation = ({ configs }: IMutationParams = {}) =>
  useMutation({
    mutationFn: (v: IVariablesType) => authApi.signIn(v.body),
    ...configs,
  });
