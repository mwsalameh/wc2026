export const colors = {
  background: '#020B18',
  surface: '#061524',
  surfaceElevated: '#0D2137',
  border: '#1A3550',

  gold: '#F4C842',
  goldLight: '#F8D96A',
  goldSubtle: '#FBE99A',

  live: '#E53935',
  win: '#43A047',
  draw: '#FB8C00',
  loss: '#E53935',

  white: '#FFFFFF',
  textPrimary: '#FFFFFF',
  textSecondary: '#CBD5E1',
  textMuted: '#9AA5B4',

  tabActive: '#F4C842',
  tabInactive: '#9AA5B4',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  full: 999,
} as const;

export const fontSize = {
  display: 56,
  score: 40,
  h1: 22,
  h2: 18,
  body: 15,
  small: 13,
  xs: 11,
} as const;

export const fontFamily = {
  display: 'BebasNeue_400Regular',
  bodyRegular: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
  arabicRegular: 'Cairo_400Regular',
  arabicMedium: 'Cairo_500Medium',
  arabicSemiBold: 'Cairo_600SemiBold',
} as const;
