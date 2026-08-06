import { ScrollView, StyleSheet, Text } from 'react-native';
import * as Haptics from 'expo-haptics';
import AnimatedPressable from './AnimatedPressable';
import { getCategoryIcon } from '../lib/categoryIcons';
import { radius, spacing, typography, type ThemeColors } from '../lib/theme';
import { useThemedStyles, useTheme } from '../lib/useTheme';
import type { Category } from '../types';

interface CategoryFilterChipsProps {
  categories: Category[];
  /** null means "All categories". */
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

/**
 * Unlike CategoryChipList (used on the Add Transaction form), this shows
 * every category regardless of type or hidden status — a past transaction
 * can be tagged to a category the user has since hidden, and history should
 * still be able to filter by it — plus a leading "All" option.
 */
export default function CategoryFilterChips({
  categories,
  selectedId,
  onSelect,
}: CategoryFilterChipsProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      <AnimatedPressable
        onPress={() => {
          Haptics.selectionAsync();
          onSelect(null);
        }}
        haptic="none"
        scaleTo={0.96}
        style={[styles.chip, selectedId === null && styles.chipSelected]}
        accessibilityRole="button"
        accessibilityState={{ selected: selectedId === null }}
        accessibilityLabel="All categories"
      >
        <Text style={[styles.chipText, selectedId === null && styles.chipTextSelected]}>All</Text>
      </AnimatedPressable>

      {categories.map((category) => {
        const selected = category.id === selectedId;
        const Icon = getCategoryIcon(category.icon);
        const tint = category.color ?? colors.primary;

        return (
          <AnimatedPressable
            key={category.id}
            onPress={() => {
              Haptics.selectionAsync();
              onSelect(category.id);
            }}
            haptic="none"
            scaleTo={0.96}
            style={[
              styles.chip,
              selected
                ? { backgroundColor: tint, borderColor: tint }
                : { borderColor: colors.border },
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={category.name}
          >
            <Icon size={14} strokeWidth={2} color={selected ? colors.textInverse : tint} />
            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
              {category.name}
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
