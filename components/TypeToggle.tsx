import { StyleSheet, Text, View } from 'react-native';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import AnimatedPressable from './AnimatedPressable';
import { colors, radius, spacing, typography } from '../lib/theme';
import type { TransactionType } from '../types';

interface TypeToggleProps {
  value: TransactionType;
  onChange: (value: TransactionType) => void;
  disabled?: boolean;
}

const OPTIONS: { value: TransactionType; label: string; color: string }[] = [
  { value: 'expense', label: 'Expense', color: colors.danger },
  { value: 'income', label: 'Income', color: colors.success },
];

export default function TypeToggle({ value, onChange, disabled }: TypeToggleProps) {
  return (
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
                  style={[styles.segmentFill, { backgroundColor: option.color }]}
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
  );
}

const styles = StyleSheet.create({
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
  },
  segmentLabel: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  segmentLabelSelected: {
    color: colors.textInverse,
  },
});
