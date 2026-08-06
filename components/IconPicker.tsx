import { StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import AnimatedPressable from './AnimatedPressable';
import { CATEGORY_ICONS } from '../lib/categoryIcons';
import { radius, spacing, typography, type ThemeColors } from '../lib/theme';
import { useThemedStyles, useTheme } from '../lib/useTheme';

interface IconPickerProps {
  value: string;
  onChange: (key: string) => void;
  /** Tints the selected cell — pass the color currently chosen in ColorPicker. */
  accentColor: string;
}

const CELL_SIZE = 48;

export default function IconPicker({ value, onChange, accentColor }: IconPickerProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View>
      <Text style={styles.label}>ICON</Text>
      <View style={styles.grid}>
        {CATEGORY_ICONS.map(({ key, Icon }) => {
          const selected = key === value;
          return (
            <AnimatedPressable
              key={key}
              onPress={() => {
                Haptics.selectionAsync();
                onChange(key);
              }}
              haptic="none"
              scaleTo={0.88}
              style={[
                styles.cell,
                selected && { backgroundColor: accentColor, borderColor: accentColor },
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={`Icon: ${key.replace(/-/g, ' ')}`}
            >
              <Icon
                size={20}
                strokeWidth={2}
                color={selected ? colors.textInverse : colors.textSecondary}
              />
            </AnimatedPressable>
          );
        })}
      </View>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  label: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
