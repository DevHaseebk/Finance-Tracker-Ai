import { useCallback } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { MotiView } from 'moti';
import { ChartColumn, AlertCircle, TrendingUp, PieChart as PieChartIcon } from 'lucide-react-native';
import TypeToggle from '../components/TypeToggle';
import RangeSelector from '../components/RangeSelector';
import DonutChart from '../components/DonutChart';
import CategoryLegend from '../components/CategoryLegend';
import TrendBarChart from '../components/TrendBarChart';
import SavingsLineChart from '../components/SavingsLineChart';
import TopCategoriesList from '../components/TopCategoriesList';
import { useAnalyticsStore } from '../store/analyticsStore';
import { RANGE_PRESET_LABELS } from '../lib/analyticsRange';
import { colors, motion, radius, shadow, spacing, staggerDelay, typography } from '../lib/theme';
import { FAB_CLEARANCE } from '../components/FloatingActionButton';

export default function AnalyticsScreen() {
  const rangePreset = useAnalyticsStore((s) => s.rangePreset);
  const breakdownType = useAnalyticsStore((s) => s.breakdownType);
  const expenseBreakdown = useAnalyticsStore((s) => s.expenseBreakdown);
  const incomeBreakdown = useAnalyticsStore((s) => s.incomeBreakdown);
  const monthlyTrend = useAnalyticsStore((s) => s.monthlyTrend);
  const savingsTrend = useAnalyticsStore((s) => s.savingsTrend);
  const isLoadingBreakdown = useAnalyticsStore((s) => s.isLoadingBreakdown);
  const isLoadingTrends = useAnalyticsStore((s) => s.isLoadingTrends);
  const error = useAnalyticsStore((s) => s.error);
  const setRangePreset = useAnalyticsStore((s) => s.setRangePreset);
  const setBreakdownType = useAnalyticsStore((s) => s.setBreakdownType);
  const fetchBreakdown = useAnalyticsStore((s) => s.fetchBreakdown);
  const fetchTrends = useAnalyticsStore((s) => s.fetchTrends);

  useFocusEffect(
    useCallback(() => {
      fetchBreakdown();
      fetchTrends();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const activeBreakdown = breakdownType === 'expense' ? expenseBreakdown : incomeBreakdown;
  const hasTrendData = monthlyTrend.some((p) => p.income > 0 || p.expense > 0);
  const hasSavingsData = savingsTrend.length > 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <MotiView {...motion.slideUp}>
          <Text style={styles.title}>Analytics</Text>
        </MotiView>

        <MotiView {...motion.fadeIn} delay={80} style={styles.rangeWrapper}>
          <RangeSelector value={rangePreset} onChange={setRangePreset} />
        </MotiView>

        {error ? (
          <View style={styles.errorBlock}>
            <AlertCircle size={28} strokeWidth={1.5} color={colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Category breakdown donut + legend */}
        <MotiView {...motion.cardEntrance} delay={staggerDelay(1, 80, 120)} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Breakdown</Text>
            <Text style={styles.cardSubtitle}>{RANGE_PRESET_LABELS[rangePreset]}</Text>
          </View>

          <View style={styles.toggleWrapper}>
            <TypeToggle value={breakdownType} onChange={setBreakdownType} />
          </View>

          {isLoadingBreakdown && activeBreakdown.length === 0 ? (
            <View style={styles.centerBlock}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : activeBreakdown.length === 0 ? (
            <View style={styles.emptyBlock}>
              <PieChartIcon size={32} strokeWidth={1.5} color={colors.textMuted} />
              <Text style={styles.emptyText}>
                No {breakdownType === 'expense' ? 'spending' : 'income'} in this range.
              </Text>
            </View>
          ) : (
            <View style={styles.breakdownBody}>
              <DonutChart
                data={activeBreakdown}
                centerLabel={breakdownType === 'expense' ? 'Spent' : 'Earned'}
              />
              <View style={styles.legendWrapper}>
                <CategoryLegend data={activeBreakdown} />
              </View>
            </View>
          )}
        </MotiView>

        {/* Top spending categories — always expense, independent of the toggle */}
        <MotiView {...motion.cardEntrance} delay={staggerDelay(2, 80, 120)} style={styles.card}>
          <Text style={styles.cardTitle}>Top Spending Categories</Text>
          <Text style={styles.cardSubtitle}>{RANGE_PRESET_LABELS[rangePreset]}</Text>

          {isLoadingBreakdown && expenseBreakdown.length === 0 ? (
            <View style={styles.centerBlock}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : expenseBreakdown.length === 0 ? (
            <View style={styles.emptyBlock}>
              <ChartColumn size={32} strokeWidth={1.5} color={colors.textMuted} />
              <Text style={styles.emptyText}>No spending in this range.</Text>
            </View>
          ) : (
            <View style={styles.topListWrapper}>
              <TopCategoriesList data={expenseBreakdown} />
            </View>
          )}
        </MotiView>

        {/* Monthly income vs expense trend */}
        <MotiView {...motion.cardEntrance} delay={staggerDelay(3, 80, 120)} style={styles.card}>
          <Text style={styles.cardTitle}>Monthly Trend</Text>
          <Text style={styles.cardSubtitle}>Last 6 months</Text>

          {isLoadingTrends && monthlyTrend.length === 0 ? (
            <View style={styles.centerBlock}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : !hasTrendData ? (
            <View style={styles.emptyBlock}>
              <ChartColumn size={32} strokeWidth={1.5} color={colors.textMuted} />
              <Text style={styles.emptyText}>No transactions in the last 6 months.</Text>
            </View>
          ) : (
            <View style={styles.chartWrapper}>
              <TrendBarChart data={monthlyTrend} />
            </View>
          )}
        </MotiView>

        {/* Savings trend */}
        <MotiView {...motion.cardEntrance} delay={staggerDelay(4, 80, 120)} style={styles.card}>
          <Text style={styles.cardTitle}>Savings Trend</Text>
          <Text style={styles.cardSubtitle}>Cumulative balance, last 6 months</Text>

          {isLoadingTrends && savingsTrend.length === 0 ? (
            <View style={styles.centerBlock}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : !hasSavingsData ? (
            <View style={styles.emptyBlock}>
              <TrendingUp size={32} strokeWidth={1.5} color={colors.textMuted} />
              <Text style={styles.emptyText}>Not enough history yet.</Text>
            </View>
          ) : (
            <View style={styles.chartWrapper}>
              <SavingsLineChart data={savingsTrend} />
            </View>
          )}
        </MotiView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: {
    padding: spacing.lg,
    paddingBottom: FAB_CLEARANCE,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  rangeWrapper: {
    marginBottom: spacing.lg,
  },
  errorBlock: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  errorText: {
    ...typography.caption,
    color: colors.danger,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadow.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.text,
  },
  cardSubtitle: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  toggleWrapper: {
    marginBottom: spacing.lg,
  },
  breakdownBody: {
    alignItems: 'center',
  },
  legendWrapper: {
    width: '100%',
    marginTop: spacing.lg,
  },
  topListWrapper: {
    marginTop: spacing.sm,
  },
  chartWrapper: {
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  centerBlock: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  emptyBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  emptyText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 240,
  },
});
