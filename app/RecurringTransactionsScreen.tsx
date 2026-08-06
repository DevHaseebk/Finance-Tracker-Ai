import { useCallback } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { MotiView } from 'moti';
import { ChevronLeft, ChevronRight, Plus, Repeat, AlertCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import AnimatedPressable from '../components/AnimatedPressable';
import { useRecurringStore } from '../store/recurringStore';
import { getCategoryIcon } from '../lib/categoryIcons';
import { describeRecurringSchedule, formatCurrency } from '../lib/utils';
import { colors, motion, radius, shadow, spacing, staggerDelay, typography } from '../lib/theme';
import type { RecurringTransactionWithCategory, RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'RecurringTransactions'>;

export default function RecurringTransactionsScreen({ navigation }: Props) {
  const rules = useRecurringStore((s) => s.rules);
  const isLoading = useRecurringStore((s) => s.isLoading);
  const error = useRecurringStore((s) => s.error);
  const fetchRules = useRecurringStore((s) => s.fetchRules);
  const setActive = useRecurringStore((s) => s.setActive);

  // Refetch whenever the screen regains focus, so adds/edits/deletes made
  // elsewhere (Add Transaction's toggle, RecurringFormScreen) show up without
  // a manual refresh.
  useFocusEffect(
    useCallback(() => {
      fetchRules();
    }, [fetchRules])
  );

  const active = rules.filter((r) => r.isActive);
  const paused = rules.filter((r) => !r.isActive);

  const handleToggleActive = async (rule: RecurringTransactionWithCategory) => {
    Haptics.selectionAsync();
    const result = await setActive(rule.id, !rule.isActive);
    if (result.error) {
      Toast.show({ type: 'error', text1: 'Could not update', text2: result.error });
    }
  };

  const renderRow = (rule: RecurringTransactionWithCategory, index: number) => {
    const Icon = getCategoryIcon(rule.categoryIcon);
    const tint = rule.categoryColor ?? colors.primary;
    const amountColor = rule.type === 'income' ? colors.success : colors.danger;
    const amountSign = rule.type === 'income' ? '+' : '−';

    return (
      <MotiView
        key={rule.id}
        {...motion.cardEntrance}
        delay={staggerDelay(index, 30)}
        style={[styles.row, !rule.isActive && styles.rowPaused]}
      >
        <View style={[styles.swatch, { backgroundColor: tint }]}>
          <Icon size={18} strokeWidth={2} color={colors.textInverse} />
        </View>

        <View style={styles.rowText}>
          <Text style={styles.rowName} numberOfLines={1}>
            {rule.categoryName}
          </Text>
          <Text style={styles.rowMeta} numberOfLines={1}>
            {describeRecurringSchedule(rule)}
          </Text>
        </View>

        <Text style={[styles.rowAmount, { color: amountColor }]} numberOfLines={1}>
          {amountSign}
          {formatCurrency(rule.amount)}
        </Text>

        <Switch
          value={rule.isActive}
          onValueChange={() => handleToggleActive(rule)}
          trackColor={{ false: colors.border, true: colors.primaryLight }}
          thumbColor={rule.isActive ? colors.primary : colors.textMuted}
          accessibilityLabel={`${rule.isActive ? 'Pause' : 'Resume'} ${rule.categoryName}`}
        />

        <AnimatedPressable
          onPress={() => navigation.navigate('RecurringForm', { recurringId: rule.id })}
          haptic="light"
          scaleTo={0.85}
          style={styles.actionButton}
          hitSlop={{ top: 8, bottom: 8, right: 8, left: 2 }}
          accessibilityRole="button"
          accessibilityLabel={`Edit ${rule.categoryName} recurring transaction`}
        >
          <ChevronRight size={18} strokeWidth={2} color={colors.textMuted} />
        </AnimatedPressable>
      </MotiView>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <AnimatedPressable
          onPress={() => navigation.goBack()}
          haptic="light"
          scaleTo={0.9}
          style={styles.headerButton}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ChevronLeft size={22} strokeWidth={2.5} color={colors.text} />
        </AnimatedPressable>
        <Text style={styles.title}>Recurring</Text>
        <AnimatedPressable
          onPress={() => navigation.navigate('AddTransaction', { initialRecurring: true })}
          haptic="medium"
          scaleTo={0.9}
          style={[styles.headerButton, styles.addButton]}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Add recurring transaction"
        >
          <Plus size={20} strokeWidth={2.5} color={colors.textInverse} />
        </AnimatedPressable>
      </View>

      {isLoading && rules.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <AlertCircle size={32} strokeWidth={1.5} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
          <AnimatedPressable
            onPress={fetchRules}
            haptic="light"
            scaleTo={0.96}
            style={styles.retryButton}
            accessibilityRole="button"
            accessibilityLabel="Retry loading recurring transactions"
          >
            <Text style={styles.retryText}>Retry</Text>
          </AnimatedPressable>
        </View>
      ) : rules.length === 0 ? (
        <View style={styles.center}>
          <Repeat size={36} strokeWidth={1.5} color={colors.textMuted} />
          <Text style={styles.emptyText}>
            No recurring transactions yet. Add one from the Add Transaction screen.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {active.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>ACTIVE</Text>
              <View style={styles.sectionList}>{active.map((r, i) => renderRow(r, i))}</View>
            </View>
          ) : null}

          {paused.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>PAUSED</Text>
              <View style={styles.sectionList}>{paused.map((r, i) => renderRow(r, i))}</View>
            </View>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.sm,
  },
  addButton: {
    backgroundColor: colors.primary,
    marginLeft: 'auto',
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
  },
  errorText: {
    ...typography.caption,
    color: colors.danger,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
  },
  retryText: {
    ...typography.bodyMedium,
    color: colors.primary,
  },
  emptyText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 260,
  },
  list: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  sectionList: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    ...shadow.sm,
  },
  rowPaused: {
    opacity: 0.6,
  },
  swatch: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1 },
  rowName: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  rowMeta: {
    ...typography.label,
    color: colors.textMuted,
    marginTop: 2,
  },
  rowAmount: {
    ...typography.bodyMedium,
    fontFamily: 'Inter_600SemiBold',
  },
  actionButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
