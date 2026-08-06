import { useCallback } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MotiView } from 'moti';
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  CirclePlus,
  CircleMinus,
  AlertCircle,
  Receipt,
} from 'lucide-react-native';
import AnimatedPressable from '../components/AnimatedPressable';
import TransactionListItem from '../components/TransactionListItem';
import { useDashboardStore } from '../store/dashboardStore';
import { formatCurrency, signedAmount } from '../lib/utils';
import { colors, motion, radius, shadow, spacing, staggerDelay, typography } from '../lib/theme';
import { FAB_CLEARANCE } from '../components/FloatingActionButton';
import type { RootStackParamList } from '../types';

export default function DashboardScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const summary = useDashboardStore((s) => s.summary);
  const recentTransactions = useDashboardStore((s) => s.recentTransactions);
  const isLoading = useDashboardStore((s) => s.isLoading);
  const error = useDashboardStore((s) => s.error);
  const fetchDashboard = useDashboardStore((s) => s.fetchDashboard);

  // Refetch every time Dashboard regains focus, so saving a transaction in the
  // modal (which just calls goBack()) shows up immediately on return.
  useFocusEffect(
    useCallback(() => {
      fetchDashboard();
    }, [fetchDashboard])
  );

  const balancePositive = (summary?.balance ?? 0) >= 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <MotiView {...motion.slideUp} delay={staggerDelay(0)}>
          <Text style={styles.title}>Dashboard</Text>
        </MotiView>

        {isLoading && !summary ? (
          <View style={styles.loadingBlock}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : error ? (
          <View style={styles.errorBlock}>
            <AlertCircle size={28} strokeWidth={1.5} color={colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <>
            {/* Balance card */}
            <MotiView {...motion.cardEntrance} delay={staggerDelay(1)} style={styles.card}>
              <Text style={styles.cardLabel}>TOTAL BALANCE</Text>
              <Text
                style={[
                  styles.balanceValue,
                  { color: balancePositive ? colors.text : colors.danger },
                ]}
                numberOfLines={1}
              >
                {formatCurrency(summary?.balance ?? 0)}
              </Text>
              <Text style={styles.breakdown}>
                Carried from before: {formatCurrency(summary?.carriedBefore ?? 0)}
                {'  ·  '}
                This month: {signedAmount(summary?.monthNet ?? 0)}
              </Text>
            </MotiView>

            {/* Quick actions */}
            <MotiView
              {...motion.fadeIn}
              delay={staggerDelay(2, 80, 120)}
              style={styles.quickActions}
            >
              <AnimatedPressable
                onPress={() => navigation.navigate('AddTransaction', { initialType: 'income' })}
                haptic="medium"
                scaleTo={0.97}
                style={[styles.quickAction, styles.quickActionIncome]}
                accessibilityRole="button"
                accessibilityLabel="Add income"
              >
                <CirclePlus size={18} strokeWidth={2} color={colors.success} />
                <Text style={[styles.quickActionText, { color: colors.success }]}>
                  Add Income
                </Text>
              </AnimatedPressable>

              <AnimatedPressable
                onPress={() => navigation.navigate('AddTransaction', { initialType: 'expense' })}
                haptic="medium"
                scaleTo={0.97}
                style={[styles.quickAction, styles.quickActionExpense]}
                accessibilityRole="button"
                accessibilityLabel="Add expense"
              >
                <CircleMinus size={18} strokeWidth={2} color={colors.danger} />
                <Text style={[styles.quickActionText, { color: colors.danger }]}>
                  Add Expense
                </Text>
              </AnimatedPressable>
            </MotiView>

            {/* This Month card */}
            <MotiView
              {...motion.cardEntrance}
              delay={staggerDelay(3, 80, 120)}
              style={styles.card}
            >
              <Text style={styles.cardLabel}>THIS MONTH</Text>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <View style={[styles.statIcon, { backgroundColor: colors.successLight }]}>
                    <TrendingUp size={16} strokeWidth={2} color={colors.success} />
                  </View>
                  <Text style={styles.statLabel}>Income</Text>
                  <Text style={[styles.statValue, { color: colors.success }]} numberOfLines={1}>
                    {formatCurrency(summary?.monthIncome ?? 0)}
                  </Text>
                </View>

                <View style={styles.statItem}>
                  <View style={[styles.statIcon, { backgroundColor: colors.dangerLight }]}>
                    <TrendingDown size={16} strokeWidth={2} color={colors.danger} />
                  </View>
                  <Text style={styles.statLabel}>Expense</Text>
                  <Text style={[styles.statValue, { color: colors.danger }]} numberOfLines={1}>
                    {formatCurrency(summary?.monthExpense ?? 0)}
                  </Text>
                </View>

                <View style={styles.statItem}>
                  <View style={[styles.statIcon, { backgroundColor: colors.primaryLight }]}>
                    <PiggyBank size={16} strokeWidth={2} color={colors.primary} />
                  </View>
                  <Text style={styles.statLabel}>Net Savings</Text>
                  <Text style={[styles.statValue, { color: colors.primary }]} numberOfLines={1}>
                    {signedAmount(summary?.monthNet ?? 0)}
                  </Text>
                </View>
              </View>
            </MotiView>

            {/* Recent transactions */}
            <MotiView {...motion.fadeIn} delay={staggerDelay(4, 80, 160)} style={styles.section}>
              <Text style={styles.sectionTitle}>RECENT TRANSACTIONS</Text>

              {recentTransactions.length === 0 ? (
                <View style={styles.emptyState}>
                  <Receipt size={32} strokeWidth={1.5} color={colors.textMuted} />
                  <Text style={styles.emptyText}>
                    No transactions yet. Add your first one above.
                  </Text>
                </View>
              ) : (
                <View style={styles.list}>
                  {recentTransactions.map((tx, index) => (
                    <TransactionListItem key={tx.id} transaction={tx} index={index} />
                  ))}
                </View>
              )}
            </MotiView>
          </>
        )}
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
    marginBottom: spacing.xl,
  },
  loadingBlock: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  errorBlock: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    gap: spacing.md,
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
  cardLabel: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  balanceValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 36,
    marginBottom: spacing.sm,
  },
  breakdown: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  quickAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1.5,
  },
  quickActionIncome: {
    backgroundColor: colors.successLight,
    borderColor: colors.successLight,
  },
  quickActionExpense: {
    backgroundColor: colors.dangerLight,
    borderColor: colors.dangerLight,
  },
  quickActionText: {
    ...typography.bodyMedium,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'flex-start',
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statLabel: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: 2,
  },
  statValue: {
    ...typography.bodyMedium,
    fontFamily: 'Inter_700Bold',
  },
  section: {
    marginTop: spacing.xs,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  list: {
    gap: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
    backgroundColor: colors.card,
    borderRadius: radius.md,
  },
  emptyText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 240,
  },
});
