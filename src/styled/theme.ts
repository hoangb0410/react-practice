import { Colors } from '@/constants';

export const lightTheme = {
  name: 'light' as const,
  colors: {
    bg: Colors.white_20,
    surface: Colors.white_10,
    border: Colors.pink_20,
    text: Colors.black_20,
    textMuted: Colors.gray_60,
    primary: Colors.pink_60,
    primaryHover: Colors.pink_70,
    primarySoft: Colors.pink_10,
    danger: Colors.red_10,
    success: Colors.green_10,
    warning: Colors.yellow_10,
  },
  radii: { sm: '6px', md: '10px', lg: '16px' },
  spacing: (n: number) => `${n * 4}px`,
};

export type AppTheme = typeof lightTheme;
