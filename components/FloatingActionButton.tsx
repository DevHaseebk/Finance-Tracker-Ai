import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { Plus } from 'lucide-react-native';
import AnimatedPressable from './AnimatedPressable';
import { radius, shadow, spacing, type ThemeColors } from '../lib/theme';
import { useThemedStyles, useTheme } from '../lib/useTheme';

export const FAB_SIZE = 60;

/** Bottom padding a scroll view needs so content clears the FAB and tab bar. */
export const FAB_CLEARANCE = FAB_SIZE + spacing.xxl + spacing.lg;

interface FloatingActionButtonProps {
  onPress: () => void;
  accessibilityLabel?: string;
}

/**
 * Floating action button pinned above the tab bar. Rendered as a sibling of the
 * tab navigator rather than inside a screen, so it stays visible on every tab.
 */
export default function FloatingActionButton({
  onPress,
  accessibilityLabel = 'Add transaction',
}: FloatingActionButtonProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();

  // Sit above the tab bar: its own height plus the device's bottom inset.
  const bottom = insets.bottom + spacing.xxl + spacing.xl;

  return (
    <View style={[styles.wrapper, { bottom }]} pointerEvents="box-none">
      <MotiView
        from={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 14, stiffness: 220, delay: 250 }}
      >
        <AnimatedPressable
          onPress={onPress}
          haptic="medium"
          scaleTo={0.9}
          style={styles.fab}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
        >
          <Plus color={colors.textInverse} size={28} strokeWidth={2.5} />
        </AnimatedPressable>
      </MotiView>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  wrapper: {
    position: 'absolute',
    right: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.lg,
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.35,
  },
});
