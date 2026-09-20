import 'axios';
import 'styled-components';
import type { AppTheme } from '@/styled';

declare module '*.svg';
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.webp';
declare module '*.gif';
declare module '*.ttf';
declare module '*.scss' {
  const css: { [key: string]: string };
  export default css;
}

declare module 'axios' {
  export interface AxiosRequestConfig {
    _retry?: boolean;
    _skipAuthLogout?: boolean;
  }
}

declare module 'styled-components' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-empty-interface
  export interface DefaultTheme extends AppTheme {}
}
