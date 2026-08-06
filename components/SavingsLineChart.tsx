import { View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { format } from 'date-fns';
import { colors } from '../lib/theme';
import { CURRENCY_SYMBOL } from '../lib/utils';
import type { SavingsTrendPoint } from '../types';

interface SavingsLineChartProps {
  data: SavingsTrendPoint[];
}

// gifted-charts-core deep-clones style objects it's handed (it tags them with
// a temporary isActiveClone marker while walking). StyleSheet.create() output
// is frozen on web, so that clone throws — this must stay a plain, unfrozen
// object literal, never a StyleSheet.create() result.
const AXIS_LABEL_STYLE = { color: colors.textMuted, fontSize: 10 };

export default function SavingsLineChart({ data }: SavingsLineChartProps) {
  const lineData = data.map((point) => ({
    value: point.balance,
    label: format(new Date(`${point.month}T00:00:00`), 'MMM'),
    labelTextStyle: AXIS_LABEL_STYLE,
  }));

  return (
    <View>
      <LineChart
        data={lineData}
        height={160}
        color={colors.primary}
        thickness={3}
        curved
        areaChart
        startFillColor={colors.primary}
        endFillColor={colors.primary}
        startOpacity={0.25}
        endOpacity={0.02}
        dataPointsColor={colors.primary}
        dataPointsRadius={4}
        yAxisThickness={0}
        xAxisColor={colors.border}
        xAxisThickness={1}
        hideRules
        noOfSections={4}
        yAxisTextStyle={AXIS_LABEL_STYLE}
        yAxisLabelPrefix={`${CURRENCY_SYMBOL} `}
        isAnimated
        animationDuration={450}
        initialSpacing={16}
        endSpacing={16}
      />
    </View>
  );
}
