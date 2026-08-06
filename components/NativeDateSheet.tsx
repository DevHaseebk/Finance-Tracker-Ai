import { Modal, Pressable, StyleSheet, Text } from 'react-native';
import { Check } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AnimatedPressable from './AnimatedPressable';
import { colors, radius, shadow, spacing, typography } from '../lib/theme';

interface NativeDateSheetProps {
  visible: boolean;
  value: Date;
  minimumDate?: Date;
  maximumDate?: Date;
  onChange: (date: Date) => void;
  onClose: () => void;
}

/** iOS-only inline date picker in a small modal sheet, with a Done button. */
export default function NativeDateSheet({
  visible,
  value,
  minimumDate,
  maximumDate,
  onChange,
  onClose,
}: NativeDateSheetProps) {
  return (
    <Modal transparent animationType="fade" visible={visible}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <DateTimePicker
            value={value}
            mode="date"
            display="inline"
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            onChange={(_event, selected) => {
              if (selected) onChange(selected);
            }}
          />
          <AnimatedPressable
            onPress={onClose}
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
  );
}

const styles = StyleSheet.create({
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
