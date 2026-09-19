import { UseMutationOptions } from '@tanstack/react-query';
import { IAppResponse } from '@/interfaces';

export type IAppMutationOptions<
  TVariables,
  TResponse = unknown,
  TError = unknown,
  TContext = unknown,
> = UseMutationOptions<IAppResponse<TResponse>, TError, TVariables, TContext>;

export type TQueryKey = readonly unknown[];
