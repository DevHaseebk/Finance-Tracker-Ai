import { StyleSheet, Text, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { CATEGORY_COLORS } from '../lib/categoryColors';
import { formatCurrency } from '../lib/utils';
import { typography, type ThemeColors } from '../lib/theme';
import { useThemedStyles, useTheme } from '../lib/useTheme';
import type { CategoryBreakdownItem } from '../types';

interface DonutChartProps {
  data: CategoryBreakdownItem[];
  centerLabel: string;
}

const RADIUS = 84;
const INNER_RADIUS = 58;

export default function DonutChart({ data, centerLabel }: DonutChartProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const total = data.reduce((sum, item) => sum + item.amount, 0);

  const pieData = data.map((item, index) => ({
    value: item.amount,
    color: item.color ?? CATEGORY_COLORS[index % CATEGORY_COLORS.length],
  }));

  return (
    <View style={styles.container}>
      <PieChart
        data={pieData}
        donut
        radius={RADIUS}
        innerRadius={INNER_RADIUS}
        innerCircleColor={colors.card}
        strokeColor={colors.card}
        strokeWidth={3}
        isAnimated
        animationDuration={500}
        centerLabelComponent={() => (
          <View style={styles.centerLabel}>
            <Text style={styles.centerValue} numberOfLines={1}>
              {formatCurrency(total)}
            </Text>
            <Text style={styles.centerHint}>{centerLabel}</Text>
          </View>
        )}
      />
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerLabel: {
    alignItems: 'center',
    justifyContent: 'center',
    width: INNER_RADIUS * 2 - 16,
  },
  centerValue: {
    ...typography.h3,
    color: colors.text,
  },
  centerHint: {
    ...typography.label,
    color: colors.textMuted,
    marginTop: 2,
  },
});
