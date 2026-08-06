import { StyleSheet, Text, View } from 'react-native';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import AnimatedPressable from './AnimatedPressable';
import { colors, radius, spacing, typography } from '../lib/theme';
import type { RecurringFrequency } from '../types';

interface FrequencyPickerProps {
  value: RecurringFrequency;
  onChange: (value: RecurringFrequency) => void;
  disabled?: boolean;
}

const OPTIONS: { value: RecurringFrequency; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

export default function FrequencyPicker({ value, onChange, disabled }: FrequencyPickerProps) {
  return (
    <View>
      <Text style={styles.label}>FREQUENCY</Text>
      <View style={styles.track}>
        {OPTIONS.map((option) => {
          const selected = option.value === value;
          return (
            <AnimatedPressable
              key={option.value}
              onPress={() => {
                if (!selected) {
                  Haptics.selectionAsync();
                  onChange(option.value);
                }
              }}
              disabled={disabled}
              haptic="none"
              scaleTo={0.97}
              style={styles.segmentWrapper}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={option.label}
            >
              <View style={styles.segment}>
                {selected ? (
                  <MotiView
                    from={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ type: 'timing', duration: 150 }}
                    style={styles.segmentFill}
                  />
                ) : null}
                <Text style={[styles.segmentLabel, selected && styles.segmentLabelSelected]}>
                  {option.label}
                </Text>
              </View>
            </AnimatedPressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  track: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  segmentWrapper: { flex: 1 },
  segment: {
    height: 44,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  segmentFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
  },
  segmentLabel: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  segmentLabelSelected: {
    color: colors.textInverse,
  },
});
