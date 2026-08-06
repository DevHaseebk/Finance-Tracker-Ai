import type { DimensionValue, ViewStyle } from 'react-native';
import { MotiView } from 'moti';
import { radius as radiusTokens } from '../lib/theme';
import { useTheme } from '../lib/useTheme';

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  /** Stagger this block's pulse against its neighbors — pass an increasing
   * value per row/column to give a whole skeleton screen a "wave" feel
   * instead of every block pulsing in flat unison. */
  delay?: number;
  style?: ViewStyle;
}

/** A shimmering placeholder block for loading states. */
export default function Skeleton({
  width = '100%',
  height = 16,
  radius = radiusTokens.sm,
  delay = 0,
  style,
}: SkeletonProps) {
  const { colors } = useTheme();
  return (
    <MotiView
      style={[{ width, height, borderRadius: radius, backgroundColor: colors.border }, style]}
      from={{ opacity: 0.45 }}
      animate={{ opacity: 0.9 }}
      transition={{
        type: 'timing',
        duration: 700,
        loop: true,
        repeatReverse: true,
        delay,
      }}
    />
  );
}
