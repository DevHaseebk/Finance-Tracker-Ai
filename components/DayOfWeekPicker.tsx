import { StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import AnimatedPressable from './AnimatedPressable';
import { colors, radius, spacing, typography } from '../lib/theme';

interface DayOfWeekPickerProps {
  /** 0=Sunday..6=Saturday, matching Postgres extract(dow from date). */
  value: number;
  onChange: (day: number) => void;
}

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function DayOfWeekPicker({ value, onChange }: DayOfWeekPickerProps) {
  return (
    <View>
      <Text style={styles.label}>REPEATS ON</Text>
      <View style={styles.row}>
        {DAYS.map((label, day) => {
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
              hitSlop={4}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={
                ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day]
              }
            >
              <Text style={[styles.cellLabel, selected && styles.cellLabelSelected]}>{label}</Text>
            </AnimatedPressable>
          );
        })}
      </View>
    </View>
  );
}

const CELL_SIZE = 40;

const styles = StyleSheet.create({
  label: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: radius.full,
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
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  cellLabelSelected: {
    color: colors.textInverse,
  },
});
