import { StyleSheet, Text, View } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import AnimatedPressable from './AnimatedPressable';
import { radius, spacing, typography, type ThemeColors } from '../lib/theme';
import { useThemedStyles, useTheme } from '../lib/useTheme';

interface MonthYearFilterProps {
  /** Both null means "All Time". */
  year: number | null;
  month: number | null; // 1-12
  onChange: (year: number | null, month: number | null) => void;
}

const MONTH_ABBR = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/**
 * "All Time" (default, zero taps) plus a ‹ month year › stepper. Stepping
 * from All Time starts at the current month; tapping All Time again clears
 * back to unfiltered.
 */
export default function MonthYearFilter({ year, month, onChange }: MonthYearFilterProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const isAllTime = year === null && month === null;

  const today = new Date();
  const activeYear = year ?? today.getFullYear();
  const activeMonth = month ?? today.getMonth() + 1;

  const step = (delta: number) => {
    Haptics.selectionAsync();
    let nextMonth = activeMonth + delta;
    let nextYear = activeYear;
    if (nextMonth < 1) {
      nextMonth = 12;
      nextYear -= 1;
    } else if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    }
    onChange(nextYear, nextMonth);
  };

  return (
    <View style={styles.row}>
      <AnimatedPressable
        onPress={() => {
          Haptics.selectionAsync();
          onChange(null, null);
        }}
        haptic="none"
        scaleTo={0.96}
        style={[styles.chip, isAllTime && styles.chipSelected]}
        accessibilityRole="button"
        accessibilityState={{ selected: isAllTime }}
        accessibilityLabel="All time"
      >
        <Text style={[styles.chipText, isAllTime && styles.chipTextSelected]}>All Time</Text>
      </AnimatedPressable>

      <View style={[styles.stepper, !isAllTime && styles.stepperActive]}>
        <AnimatedPressable
          onPress={() => step(-1)}
          haptic="none"
          scaleTo={0.85}
          style={styles.stepButton}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel="Previous month"
        >
          <ChevronLeft
            size={16}
            strokeWidth={2.5}
            color={!isAllTime ? colors.textInverse : colors.textSecondary}
          />
        </AnimatedPressable>

        <Text
          style={[styles.stepperLabel, !isAllTime && styles.stepperLabelActive]}
          numberOfLines={1}
        >
          {MONTH_ABBR[activeMonth - 1]} {activeYear}
        </Text>

        <AnimatedPressable
          onPress={() => step(1)}
          haptic="none"
          scaleTo={0.85}
          style={styles.stepButton}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel="Next month"
        >
          <ChevronRight
            size={16}
            strokeWidth={2.5}
            color={!isAllTime ? colors.textInverse : colors.textSecondary}
          />
        </AnimatedPressable>
      </View>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  chip: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.card,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    ...typography.caption,
    color: colors.text,
  },
  chipTextSelected: {
    color: colors.textInverse,
    fontFamily: 'Inter_600SemiBold',
  },
  stepper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.full,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.xs,
    height: 38,
  },
  stepperActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  stepButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperLabel: {
    ...typography.caption,
    color: colors.text,
  },
  stepperLabelActive: {
    color: colors.textInverse,
    fontFamily: 'Inter_600SemiBold',
  },
});
