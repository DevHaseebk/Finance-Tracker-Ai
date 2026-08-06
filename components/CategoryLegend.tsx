import { StyleSheet, Text, View } from 'react-native';
import { MotiView } from 'moti';
import { CATEGORY_COLORS } from '../lib/categoryColors';
import { getCategoryIcon } from '../lib/categoryIcons';
import { formatCurrency } from '../lib/utils';
import { colors, motion, radius, spacing, staggerDelay, typography } from '../lib/theme';
import type { CategoryBreakdownItem } from '../types';

interface CategoryLegendProps {
  data: CategoryBreakdownItem[];
}

export default function CategoryLegend({ data }: CategoryLegendProps) {
  return (
    <View style={styles.list}>
      {data.map((item, index) => {
        const tint = item.color ?? CATEGORY_COLORS[index % CATEGORY_COLORS.length];
        const Icon = getCategoryIcon(item.icon);

        return (
          <MotiView
            key={item.categoryId}
            {...motion.fadeIn}
            delay={staggerDelay(index, 30)}
            style={styles.row}
          >
            <View style={[styles.swatch, { backgroundColor: tint }]}>
              <Icon size={14} strokeWidth={2} color={colors.textInverse} />
            </View>
            <Text style={styles.name} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.percent}>{item.percent.toFixed(0)}%</Text>
            <Text style={styles.amount} numberOfLines={1}>
              {formatCurrency(item.amount)}
            </Text>
          </MotiView>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  swatch: {
    width: 26,
    height: 26,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    ...typography.caption,
    color: colors.text,
    flex: 1,
  },
  percent: {
    ...typography.label,
    color: colors.textMuted,
    width: 36,
    textAlign: 'right',
  },
  amount: {
    ...typography.bodyMedium,
    color: colors.text,
    width: 76,
    textAlign: 'right',
  },
});
