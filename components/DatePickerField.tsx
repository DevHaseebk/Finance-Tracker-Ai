import { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { Calendar } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import AnimatedPressable from './AnimatedPressable';
import NativeDateSheet from './NativeDateSheet';
import { openAndroidDatePicker } from '../lib/nativeDatePicker';
import { colors, radius, spacing, typography } from '../lib/theme';

interface DatePickerFieldProps {
  label?: string;
  value: Date;
  onChange: (date: Date) => void;
  minimumDate?: Date;
  /** Defaults to today — pass undefined to allow future dates too. */
  maximumDate?: Date | undefined;
}

function yesterday(): Date {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d;
}

/**
 * Defaults to today; "Yesterday" covers the next most common entry with one
 * tap, and "Pick a date" opens the native calendar for anything else — most
 * entries never need to touch this component at all.
 */
export default function DatePickerField({
  label = 'DATE',
  value,
  onChange,
  minimumDate,
  maximumDate = new Date(),
}: DatePickerFieldProps) {
  const [iosPickerOpen, setIosPickerOpen] = useState(false);
  const today = new Date();
  const yday = yesterday();
  const isCustom = !isToday(value) && !isSameDay(value, yday);

  const openPicker = () => {
    Haptics.selectionAsync();
    if (Platform.OS === 'android') {
      openAndroidDatePicker({ value, minimumDate, maximumDate, onChange });
    } else {
      // iOS renders the picker inline in a small modal below; on web the
      // library's own platform fallback makes this a harmless no-op.
      setIosPickerOpen(true);
    }
  };

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <Chip
          label="Today"
          selected={isToday(value)}
          onPress={() => {
            Haptics.selectionAsync();
            onChange(today);
          }}
        />
        <Chip
          label="Yesterday"
          selected={isYesterday(value)}
          onPress={() => {
            Haptics.selectionAsync();
            onChange(yday);
          }}
        />
        <AnimatedPressable
          onPress={openPicker}
          haptic="none"
          scaleTo={0.96}
          style={[styles.chip, isCustom && styles.chipSelected]}
          accessibilityRole="button"
          accessibilityLabel="Pick a date"
        >
          <Calendar size={14} strokeWidth={2} color={isCustom ? colors.textInverse : colors.textSecondary} />
          <Text style={[styles.chipText, isCustom && styles.chipTextSelected]}>
            {isCustom ? format(value, 'MMM d') : 'Pick date'}
          </Text>
        </AnimatedPressable>
      </View>

      {Platform.OS === 'ios' ? (
        <NativeDateSheet
          visible={iosPickerOpen}
          value={value}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onChange={onChange}
          onClose={() => setIosPickerOpen(false)}
        />
      ) : null}
    </View>
  );
}

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <AnimatedPressable
      onPress={onPress}
      haptic="none"
      scaleTo={0.96}
      style={[styles.chip, selected && styles.chipSelected]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </AnimatedPressable>
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
});
