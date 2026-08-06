import { useCallback } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MotiView } from 'moti';
import { Receipt, AlertCircle } from 'lucide-react-native';
import AnimatedPressable from '../components/AnimatedPressable';
import TransactionListItem from '../components/TransactionListItem';
import { useHistoryStore } from '../store/historyStore';
import { colors, motion, spacing, typography } from '../lib/theme';
import { FAB_CLEARANCE } from '../components/FloatingActionButton';
import type { RootStackParamList, TransactionWithCategory } from '../types';

export default function HistoryScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const transactions = useHistoryStore((s) => s.transactions);
  const isLoading = useHistoryStore((s) => s.isLoading);
  const isLoadingMore = useHistoryStore((s) => s.isLoadingMore);
  const error = useHistoryStore((s) => s.error);
  const fetchFirstPage = useHistoryStore((s) => s.fetchFirstPage);
  const fetchNextPage = useHistoryStore((s) => s.fetchNextPage);

  // Reset to page one every time History regains focus, so a transaction
  // added or edited elsewhere shows up without a manual pull-to-refresh.
  useFocusEffect(
    useCallback(() => {
      fetchFirstPage();
    }, [fetchFirstPage])
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <MotiView {...motion.slideUp}>
            <Text style={styles.title}>History</Text>
          </MotiView>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl
            refreshing={isLoading && transactions.length > 0}
            onRefresh={fetchFirstPage}
            tintColor={colors.primary}
          />
        }
        onEndReachedThreshold={0.4}
        onEndReached={fetchNextPage}
        renderItem={({ item, index }) => (
          <TransactionRow transaction={item} index={index} navigation={navigation} />
        )}
        ListFooterComponent={
          isLoadingMore ? (
            <View style={styles.footerLoading}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.center}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : error ? (
            <View style={styles.center}>
              <AlertCircle size={32} strokeWidth={1.5} color={colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : (
            <MotiView {...motion.fadeIn} delay={120} style={styles.empty}>
              <Receipt size={40} strokeWidth={1.5} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No transactions yet</Text>
              <Text style={styles.emptyHint}>
                Tap the + button to record your first income or expense.
              </Text>
            </MotiView>
          )
        }
      />
    </SafeAreaView>
  );
}

function TransactionRow({
  transaction,
  index,
  navigation,
}: {
  transaction: TransactionWithCategory;
  index: number;
  navigation: NativeStackNavigationProp<RootStackParamList>;
}) {
  return (
    <AnimatedPressable
      onPress={() => navigation.navigate('AddTransaction', { transactionId: transaction.id })}
      haptic="light"
      scaleTo={0.98}
      accessibilityRole="button"
      accessibilityLabel={`Edit ${transaction.categoryName} transaction`}
    >
      <TransactionListItem transaction={transaction} index={index < 8 ? index : 0} />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingBottom: FAB_CLEARANCE,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.xl,
  },
  separator: {
    height: spacing.sm,
  },
  footerLoading: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xxl,
  },
  errorText: {
    ...typography.caption,
    color: colors.danger,
    textAlign: 'center',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text,
  },
  emptyHint: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 260,
  },
});
