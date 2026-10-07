import { useColorScheme } from 'react-native';

export const Colors = {
  light: {
    background: '#F2F2F7',
    surface: '#FFFFFF',
    surfaceMuted: '#E9E9F0',
    text: '#111118',
    textSecondary: '#6B6B7B',
    border: '#E2E2EA',
    accent: '#5B5BD6',
    accentSoft: '#E6E6FB',
    accentMuted: '#9696E6',
    success: '#2BA471',
    danger: '#E5484D',
  },
  dark: {
    background: '#0B0B10',
    surface: '#17171F',
    surfaceMuted: '#22222C',
    text: '#F4F4F8',
    textSecondary: '#9A9AAB',
    border: '#272731',
    accent: '#8B8BF5',
    accentSoft: '#26264A',
    accentMuted: '#5A5AB4',
    success: '#3DD68C',
    danger: '#FF6369',
  },
} as const;

export type ThemeColors = { [K in keyof typeof Colors.light]: string };

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const Radius = {
  sm: 10,
  md: 16,
  lg: 24,
  pill: 999,
} as const;

export function useTheme(): ThemeColors {
  const scheme = useColorScheme();
  return scheme === 'dark' ? Colors.dark : Colors.light;
}
