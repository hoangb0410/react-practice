import { ReactNode } from 'react';
import { TypeOptions } from 'react-toastify';

export interface IAppToastOption {
  type: TypeOptions;
  content: ReactNode;
  duration?: number;
}
