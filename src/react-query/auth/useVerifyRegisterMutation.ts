import { authApi } from '@/api';
import { ISignInResponse, IVerifyRegisterBody } from '@/interfaces';
import { IAppMutationOptions } from '@/types';
import { useMutation } from '@tanstack/react-query';

interface IVariablesType {
  body: IVerifyRegisterBody;
}

interface IMutationParams {
  configs?: IAppMutationOptions<IVariablesType, ISignInResponse>;
}

export const useVerifyRegisterMutation = ({ configs }: IMutationParams = {}) =>
  useMutation({
    mutationFn: (v: IVariablesType) => authApi.verifyRegister(v.body),
    ...configs,
  });
