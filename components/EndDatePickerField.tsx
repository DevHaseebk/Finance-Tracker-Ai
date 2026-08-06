import { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { Calendar, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { format } from 'date-fns';
import AnimatedPressable from './AnimatedPressable';
import NativeDateSheet from './NativeDateSheet';
import { openAndroidDatePicker } from '../lib/nativeDatePicker';
import { colors, radius, spacing, typography } from '../lib/theme';

interface EndDatePickerFieldProps {
  /** null means "no end date" (ongoing/indefinite). */
  value: Date | null;
  onChange: (date: Date | null) => void;
  /** The rule's start date — an end date before this makes no sense. */
  minimumDate: Date;
}

/**
 * Defaults to "Ongoing" (no end date) — the common case for a recurring rule
 * needs zero taps here. Picking a date reveals a clear (×) to go back to
 * ongoing.
 */
export default function EndDatePickerField({
  value,
  onChange,
  minimumDate,
}: EndDatePickerFieldProps) {
  const [iosPickerOpen, setIosPickerOpen] = useState(false);
  const hasEndDate = value !== null;

  const openPicker = () => {
    Haptics.selectionAsync();
    const initial = value ?? minimumDate;
    if (Platform.OS === 'android') {
      openAndroidDatePicker({ value: initial, minimumDate, onChange });
    } else {
      onChange(initial);
      setIosPickerOpen(true);
    }
  };

  return (
    <View>
      <Text style={styles.label}>END DATE (OPTIONAL)</Text>
      <View style={styles.row}>
        <AnimatedPressable
          onPress={() => {
            Haptics.selectionAsync();
            onChange(null);
          }}
          haptic="none"
          scaleTo={0.96}
          style={[styles.chip, !hasEndDate && styles.chipSelected]}
          accessibilityRole="button"
          accessibilityState={{ selected: !hasEndDate }}
          accessibilityLabel="Ongoing, no end date"
        >
          <Text style={[styles.chipText, !hasEndDate && styles.chipTextSelected]}>Ongoing</Text>
        </AnimatedPressable>

        <AnimatedPressable
          onPress={openPicker}
          haptic="none"
          scaleTo={0.96}
          style={[styles.chip, hasEndDate && styles.chipSelected]}
          accessibilityRole="button"
          accessibilityLabel="Pick an end date"
        >
          <Calendar size={14} strokeWidth={2} color={hasEndDate ? colors.textInverse : colors.textSecondary} />
          <Text style={[styles.chipText, hasEndDate && styles.chipTextSelected]}>
            {hasEndDate ? format(value, 'MMM d, yyyy') : 'Pick date'}
          </Text>
        </AnimatedPressable>

        {hasEndDate ? (
          <AnimatedPressable
            onPress={() => {
              Haptics.selectionAsync();
              onChange(null);
            }}
            haptic="none"
            scaleTo={0.85}
            style={styles.clearButton}
            hitSlop={{ top: 8, bottom: 8, right: 8, left: 4 }}
            accessibilityRole="button"
            accessibilityLabel="Clear end date"
          >
            <X size={14} strokeWidth={2.5} color={colors.textSecondary} />
          </AnimatedPressable>
        ) : null}
      </View>

      {Platform.OS === 'ios' ? (
        <NativeDateSheet
          visible={iosPickerOpen}
          value={value ?? minimumDate}
          minimumDate={minimumDate}
          onChange={onChange}
          onClose={() => setIosPickerOpen(false)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
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
  clearButton: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
