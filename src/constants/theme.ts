export const Colors = {
  light: {
    text: '#111111',
    textSecondary: '#60646C',
    background: '#FFFFFF',
    card: '#F2F3F5',
    border: '#D9DADF',
    accent: '#1E88E5',
    green: '#2E9E4F',
    onGreen: '#FFFFFF',
    danger: '#D93025',
  },
  dark: {
    text: '#F5F5F5',
    textSecondary: '#B0B4BA',
    background: '#0B0B0C',
    card: '#1C1D20',
    border: '#2E3135',
    accent: '#4FA3F7',
    green: '#34B85A',
    onGreen: '#FFFFFF',
    danger: '#FF6B5E',
  },
} as const;

export type ThemeColors = (typeof Colors)['light'] | (typeof Colors)['dark'];

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
} as const;
