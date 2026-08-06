// Full design token system. Reuse across all screens/components.
// Typography uses the Inter font family — load it via lib/fonts.ts before
// rendering any screen that references `fontFamily`.

export const lightColors = {
  // Brand
  primary: '#4F46E5', // indigo
  primaryLight: '#EEF2FF',
  primaryDark: '#3730A3',
  gradient: ['#6366F1', '#4F46E5', '#4338CA'] as const,

  // Feedback
  success: '#16A34A',
  successLight: '#DCFCE7',
  danger: '#DC2626',
  dangerLight: '#FEE2E2',
  warning: '#D97706',
  warningLight: '#FEF3C7',

  // Surfaces
  background: '#F7F8FA',
  card: '#FFFFFF',
  cardTranslucent: 'rgba(255, 255, 255, 0.7)',
  border: '#E5E7EB',

  // Text
  text: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  /** Text drawn on top of a filled accent colour (primary/success/danger). */
  textInverse: '#FFFFFF',

  // Misc
  overlay: 'rgba(17, 24, 39, 0.4)',
  transparent: 'transparent',
} as const;

/**
 * Not a mechanical inversion of the light palette. Accents are lifted a few
 * steps (indigo-400 rather than indigo-600) so they stay vivid against a dark
 * surface, and their -Light variants become deep tints for chip/badge fills
 * instead of near-white washes. textInverse flips to near-black because the
 * lifted accents are now light enough that dark text reads better on them.
 */
export const darkColors = {
  // Brand
  primary: '#818CF8',
  primaryLight: '#1E1B4B',
  primaryDark: '#A5B4FC',
  gradient: ['#4338CA', '#4F46E5', '#6366F1'] as const,

  // Feedback
  success: '#4ADE80',
  successLight: '#052E16',
  danger: '#F87171',
  dangerLight: '#450A0A',
  warning: '#FBBF24',
  warningLight: '#451A03',

  // Surfaces
  background: '#0B0F19',
  card: '#151B27',
  cardTranslucent: 'rgba(21, 27, 39, 0.7)',
  border: '#252D3D',

  // Text
  text: '#F3F4F6',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  textInverse: '#0B0F19',

  // Misc
  overlay: 'rgba(0, 0, 0, 0.6)',
  transparent: 'transparent',
} as const;

/**
 * Both palettes widened to plain strings — otherwise each one's type is its own
 * set of hex literals and `dark ? darkColors : lightColors` has no common type.
 * `gradient` keeps its tuple shape because LinearGradient requires at least two
 * positional stops.
 */
export type ThemeColors = Omit<
  { readonly [K in keyof typeof lightColors]: string },
  'gradient'
> & { readonly gradient: readonly [string, string, string] };


// 4 / 8 / 12 / 16 / 24 / 32 scale
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const fontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extrabold: 'Inter_800ExtraBold',
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  display: 34,
  // Large single-value readouts (e.g. Dashboard's total balance).
  hero: 36,
  // The editable amount field on Add Transaction / Recurring forms.
  jumbo: 52,
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

// Ready-to-spread text styles pairing size + family for common roles.
export const typography = {
  display: { fontSize: fontSize.display, fontFamily: fontFamily.bold },
  h1: { fontSize: fontSize.xxl, fontFamily: fontFamily.bold },
  h2: { fontSize: fontSize.xl, fontFamily: fontFamily.semibold },
  h3: { fontSize: fontSize.lg, fontFamily: fontFamily.semibold },
  body: { fontSize: fontSize.md, fontFamily: fontFamily.regular },
  bodyMedium: { fontSize: fontSize.md, fontFamily: fontFamily.medium },
  caption: { fontSize: fontSize.sm, fontFamily: fontFamily.regular },
  label: { fontSize: fontSize.xs, fontFamily: fontFamily.medium },
} as const;

export const shadow = {
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
  },
} as const;

// Moti from/animate/transition presets — spread onto <MotiView {...fadeIn} />.
// Keep transitions spring-based for a premium, physical feel.
export const motion = {
  fadeIn: {
    from: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { type: 'timing', duration: 350 } as const,
  },
  slideUp: {
    from: { opacity: 0, translateY: 24 },
    animate: { opacity: 1, translateY: 0 },
    transition: { type: 'spring', damping: 18, stiffness: 180 } as const,
  },
  scalePress: {
    from: { scale: 1 },
    animate: { scale: 1 },
    transition: { type: 'timing', duration: 120 } as const,
    // usage: pass `animate={{ scale: pressed ? 0.96 : 1 }}` on the pressable's MotiView
  },
  cardEntrance: {
    from: { opacity: 0, translateY: 16, scale: 0.97 },
    animate: { opacity: 1, translateY: 0, scale: 1 },
    transition: { type: 'spring', damping: 20, stiffness: 200 } as const,
  },
} as const;

// Stagger helper: returns a delay in ms for the nth item in a list entrance.
export function staggerDelay(index: number, step = 60, base = 0) {
  return base + index * step;
}

// Colours are intentionally not re-exported as a single aggregate any more:
// they depend on the active scheme and must be read through useTheme() /
// useThemedStyles() so a theme change actually repaints.
