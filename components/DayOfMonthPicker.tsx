import { StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import AnimatedPressable from './AnimatedPressable';
import { radius, spacing, typography, type ThemeColors } from '../lib/theme';
import { useThemedStyles } from '../lib/useTheme';

interface DayOfMonthPickerProps {
  /** 1-31. Clamped to each month's actual last day when generating. */
  value: number;
  onChange: (day: number) => void;
}

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const CELL_SIZE = 36;

export default function DayOfMonthPicker({ value, onChange }: DayOfMonthPickerProps) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View>
      <Text style={styles.label}>REPEATS ON</Text>
      <View style={styles.grid}>
        {DAYS.map((day) => {
          const selected = day === value;
          return (
            <AnimatedPressable
              key={day}
              onPress={() => {
                Haptics.selectionAsync();
                onChange(day);
              }}
              haptic="none"
              scaleTo={0.88}
              style={[styles.cell, selected && styles.cellSelected]}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={`Day ${day}`}
            >
              <Text style={[styles.cellLabel, selected && styles.cellLabelSelected]}>{day}</Text>
            </AnimatedPressable>
          );
        })}
      </View>
      <Text style={styles.hint}>
        On shorter months, this falls on the last day of the month instead.
      </Text>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  label: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  cellLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  cellLabelSelected: {
    color: colors.textInverse,
    fontFamily: 'Inter_600SemiBold',
  },
  hint: {
    ...typography.label,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
});
