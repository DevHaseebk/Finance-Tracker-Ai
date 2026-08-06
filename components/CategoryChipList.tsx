import { ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import AnimatedPressable from './AnimatedPressable';
import { getCategoryIcon } from '../lib/categoryIcons';
import { colors, radius, spacing, typography } from '../lib/theme';
import type { Category } from '../types';

interface CategoryChipListProps {
  categories: Category[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function CategoryChipList({
  categories,
  selectedId,
  onSelect,
}: CategoryChipListProps) {
  if (categories.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>
          No categories for this type yet. Add one from Settings → Categories.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
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
            scaleTo={0.95}
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
            <Icon size={16} strokeWidth={2} color={selected ? colors.textInverse : tint} />
            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
              {category.name}
            </Text>
          </AnimatedPressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1.5,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.card,
  },
  chipText: {
    ...typography.caption,
    color: colors.text,
  },
  chipTextSelected: {
    color: colors.textInverse,
    fontFamily: 'Inter_600SemiBold',
  },
  empty: {
    paddingVertical: spacing.sm,
  },
  emptyText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
