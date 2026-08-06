import { StyleSheet, Text, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { format } from 'date-fns';
import { colors, radius, spacing, typography } from '../lib/theme';
import { CURRENCY_SYMBOL } from '../lib/utils';
import type { MonthlyTrendPoint } from '../types';

interface TrendBarChartProps {
  data: MonthlyTrendPoint[];
}

const BAR_WIDTH = 14;
const GROUP_SPACING = 22;
const PAIR_SPACING = 3;

// gifted-charts-core deep-clones style objects it's handed (it tags them
// with a temporary isActiveClone marker while walking). StyleSheet.create()
// output is frozen on web, so that clone throws — these must stay plain,
// unfrozen object literals, never StyleSheet.create() results.
const AXIS_LABEL_STYLE = { color: colors.textMuted, fontSize: 10 };

export default function TrendBarChart({ data }: TrendBarChartProps) {
  const barData = data.flatMap((point) => [
    {
      value: point.income,
      frontColor: colors.success,
      spacing: PAIR_SPACING,
      label: format(new Date(`${point.month}T00:00:00`), 'MMM'),
      labelWidth: 34,
      labelTextStyle: AXIS_LABEL_STYLE,
      barBorderTopLeftRadius: radius.sm / 2,
      barBorderTopRightRadius: radius.sm / 2,
    },
    {
      value: point.expense,
      frontColor: colors.danger,
      barBorderTopLeftRadius: radius.sm / 2,
      barBorderTopRightRadius: radius.sm / 2,
    },
  ]);

  return (
    <View>
      <View style={styles.legend}>
        <LegendDot color={colors.success} label="Income" />
        <LegendDot color={colors.danger} label="Expense" />
      </View>

      <BarChart
        data={barData}
        barWidth={BAR_WIDTH}
        spacing={GROUP_SPACING}
        roundedTop
        isAnimated
        animationDuration={450}
        noOfSections={4}
        yAxisThickness={0}
        xAxisColor={colors.border}
        xAxisThickness={1}
        hideRules
        yAxisTextStyle={AXIS_LABEL_STYLE}
        yAxisLabelPrefix={`${CURRENCY_SYMBOL} `}
        height={160}
        initialSpacing={16}
        endSpacing={8}
      />
    </View>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  legend: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
  },
  legendText: {
    ...typography.label,
    color: colors.textSecondary,
  },
});
