import { ScrollView, StyleSheet, Text } from 'react-native';
import * as Haptics from 'expo-haptics';
import AnimatedPressable from './AnimatedPressable';
import { RANGE_PRESETS, RANGE_PRESET_LABELS } from '../lib/analyticsRange';
import { radius, spacing, typography, type ThemeColors } from '../lib/theme';
import { useThemedStyles } from '../lib/useTheme';
import type { AnalyticsRangePreset } from '../types';

interface RangeSelectorProps {
  value: AnalyticsRangePreset;
  onChange: (preset: AnalyticsRangePreset) => void;
}

export default function RangeSelector({ value, onChange }: RangeSelectorProps) {
  const styles = useThemedStyles(makeStyles);
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {RANGE_PRESETS.map((preset) => {
        const selected = preset === value;
        return (
          <AnimatedPressable
            key={preset}
            onPress={() => {
              if (!selected) {
                Haptics.selectionAsync();
                onChange(preset);
              }
            }}
            haptic="none"
            scaleTo={0.96}
            style={[styles.chip, selected && styles.chipSelected]}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={RANGE_PRESET_LABELS[preset]}
          >
            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
              {RANGE_PRESET_LABELS[preset]}
            </Text>
          </AnimatedPressable>
        );
      })}
    </ScrollView>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  row: {
    gap: spacing.sm,
    paddingRight: spacing.lg,
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
});
