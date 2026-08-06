import { StyleSheet, Text, View } from 'react-native';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import AnimatedPressable from './AnimatedPressable';
import { radius, spacing, typography, type ThemeColors } from '../lib/theme';
import { useThemedStyles, useTheme } from '../lib/useTheme';
import type { TransactionType } from '../types';

interface TypeToggleProps {
  value: TransactionType;
  onChange: (value: TransactionType) => void;
  disabled?: boolean;
}

const OPTIONS: { value: TransactionType; label: string }[] = [
  { value: 'expense', label: 'Expense' },
  { value: 'income', label: 'Income' },
];

export default function TypeToggle({ value, onChange, disabled }: TypeToggleProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
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
                  style={[
                    styles.segmentFill,
                    {
                      backgroundColor:
                        option.value === 'income' ? colors.success : colors.danger,
                    },
                  ]}
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

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
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
