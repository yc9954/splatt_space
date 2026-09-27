/**
 * Splatt Space design tokens.
 *
 * The palette comes from the Figma redesign (travel_app_designed): a blue
 * primary, a warm orange accent and a blue-violet gradient for hero surfaces.
 */

export const BRAND = {
  name: 'Splatt Space',
  tagline: 'Share your travels in 3D',
  description:
    'Capture a place with your phone, turn it into a Gaussian splat and share it with the world.',
} as const;

export const Colors = {
  primary: '#4A90E2',
  primaryDark: '#3B7BC8',
  primarySoft: '#EAF2FC',
  accent: '#FF6B35',
  gradient: ['#4A90E2', '#7B68EE', '#9B59B6'] as const,
  ctaGradient: ['#4A90E2', '#FF6B35'] as const,

  text: '#1F2937',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  borderStrong: '#D1D5DB',
  surface: '#FFFFFF',
  surfaceMuted: '#F9FAFB',
  surfaceInset: '#F3F4F6',
  black: '#000000',
  white: '#FFFFFF',

  danger: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  like: '#EF4444',
} as const;

export const Radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  raised: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
} as const;
