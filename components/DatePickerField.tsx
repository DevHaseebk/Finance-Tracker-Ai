import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Calendar, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import DateTimePicker, {
  DateTimePickerAndroid,
} from '@react-native-community/datetimepicker';
import AnimatedPressable from './AnimatedPressable';
import { colors, radius, shadow, spacing, typography } from '../lib/theme';

interface DatePickerFieldProps {
  value: Date;
  onChange: (date: Date) => void;
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
export default function DatePickerField({ value, onChange }: DatePickerFieldProps) {
  const [iosPickerOpen, setIosPickerOpen] = useState(false);
  const today = new Date();
  const yday = yesterday();
  const isCustom = !isToday(value) && !isSameDay(value, yday);

  const openPicker = () => {
    Haptics.selectionAsync();
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value,
        mode: 'date',
        maximumDate: today,
        onChange: (event, selected) => {
          if (event.type === 'set' && selected) onChange(selected);
        },
      });
    } else {
      // iOS renders the picker inline in a small modal below; on web the
      // library's stub component is a no-op, so this is a native-only path.
      setIosPickerOpen(true);
    }
  };

  return (
    <View>
      <Text style={styles.label}>DATE</Text>
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
        <Modal transparent animationType="fade" visible={iosPickerOpen}>
          <Pressable style={styles.backdrop} onPress={() => setIosPickerOpen(false)}>
            <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
              <DateTimePicker
                value={value}
                mode="date"
                display="inline"
                maximumDate={today}
                onChange={(_event, selected) => {
                  if (selected) onChange(selected);
                }}
              />
              <AnimatedPressable
                onPress={() => setIosPickerOpen(false)}
                haptic="light"
                style={styles.doneButton}
                accessibilityRole="button"
                accessibilityLabel="Confirm date"
              >
                <Check size={18} strokeWidth={2.5} color={colors.textInverse} />
                <Text style={styles.doneButtonText}>Done</Text>
              </AnimatedPressable>
            </Pressable>
          </Pressable>
        </Modal>
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
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheet: {
    width: '88%',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.lg,
  },
  doneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    marginTop: spacing.md,
  },
  doneButtonText: {
    ...typography.bodyMedium,
    color: colors.textInverse,
  },
});
