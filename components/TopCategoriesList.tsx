import { StyleSheet, Text, View } from 'react-native';
import { MotiView } from 'moti';
import { CATEGORY_COLORS } from '../lib/categoryColors';
import { getCategoryIcon } from '../lib/categoryIcons';
import { formatCurrency } from '../lib/utils';
import { colors, motion, radius, spacing, staggerDelay, typography } from '../lib/theme';
import type { CategoryBreakdownItem } from '../types';

interface TopCategoriesListProps {
  data: CategoryBreakdownItem[];
  limit?: number;
}

export default function TopCategoriesList({ data, limit = 5 }: TopCategoriesListProps) {
  const top = data.slice(0, limit);

  return (
    <View style={styles.list}>
      {top.map((item, index) => {
        const tint = item.color ?? CATEGORY_COLORS[index % CATEGORY_COLORS.length];
        const Icon = getCategoryIcon(item.icon);

        return (
          <MotiView
            key={item.categoryId}
            {...motion.cardEntrance}
            delay={staggerDelay(index, 40)}
            style={styles.row}
          >
            <Text style={styles.rank}>{index + 1}</Text>

            <View style={[styles.swatch, { backgroundColor: tint }]}>
              <Icon size={16} strokeWidth={2} color={colors.textInverse} />
            </View>

            <View style={styles.middle}>
              <View style={styles.middleTop}>
                <Text style={styles.name} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.amount} numberOfLines={1}>
                  {formatCurrency(item.amount)}
                </Text>
              </View>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${Math.max(item.percent, 2)}%`, backgroundColor: tint },
                  ]}
                />
              </View>
            </View>
          </MotiView>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rank: {
    ...typography.label,
    color: colors.textMuted,
    width: 14,
    textAlign: 'center',
  },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  middle: {
    flex: 1,
  },
  middleTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  name: {
    ...typography.caption,
    color: colors.text,
    flexShrink: 1,
  },
  amount: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  barTrack: {
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: radius.full,
  },
});
