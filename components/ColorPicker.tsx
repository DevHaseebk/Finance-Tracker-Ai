import { StyleSheet, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import AnimatedPressable from './AnimatedPressable';
import { CATEGORY_COLORS } from '../lib/categoryColors';
import { colors, radius, spacing, typography } from '../lib/theme';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

const SWATCH_SIZE = 40;

export default function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <View>
      <Text style={styles.label}>COLOR</Text>
      <View style={styles.row}>
        {CATEGORY_COLORS.map((color) => {
          const selected = color === value;
          return (
            <AnimatedPressable
              key={color}
              onPress={() => {
                Haptics.selectionAsync();
                onChange(color);
              }}
              haptic="none"
              scaleTo={0.85}
              style={[styles.swatch, { backgroundColor: color }]}
              hitSlop={3}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={`Color ${color}`}
            >
              {selected ? <Check size={18} strokeWidth={3} color={colors.textInverse} /> : null}
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
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  swatch: {
    width: SWATCH_SIZE,
    height: SWATCH_SIZE,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.card,
  },
});
