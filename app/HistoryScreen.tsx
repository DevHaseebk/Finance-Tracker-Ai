import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, RefreshControl, SectionList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MotiView } from 'moti';
import { Receipt, AlertCircle, SearchX } from 'lucide-react-native';
import AnimatedPressable from '../components/AnimatedPressable';
import TransactionListItem from '../components/TransactionListItem';
import MonthYearFilter from '../components/MonthYearFilter';
import CategoryFilterChips from '../components/CategoryFilterChips';
import SearchInput from '../components/SearchInput';
import HistorySkeleton from '../components/HistorySkeleton';
import { useHistoryStore } from '../store/historyStore';
import { useCategoryStore } from '../store/categoryStore';
import { groupTransactionsByDate } from '../lib/utils';
import { motion, radius, spacing, typography, type ThemeColors } from '../lib/theme';
import { useThemedStyles, useTheme } from '../lib/useTheme';
import { FAB_CLEARANCE } from '../components/FloatingActionButton';
import type { RootStackParamList, TransactionWithCategory } from '../types';

const SEARCH_DEBOUNCE_MS = 350;

export default function HistoryScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const transactions = useHistoryStore((s) => s.transactions);
  const filters = useHistoryStore((s) => s.filters);
  const isLoading = useHistoryStore((s) => s.isLoading);
  const isLoadingMore = useHistoryStore((s) => s.isLoadingMore);
  const error = useHistoryStore((s) => s.error);
  const fetchFirstPage = useHistoryStore((s) => s.fetchFirstPage);
  const fetchNextPage = useHistoryStore((s) => s.fetchNextPage);
  const setFilters = useHistoryStore((s) => s.setFilters);

  const categories = useCategoryStore((s) => s.categories);
  const fetchCategories = useCategoryStore((s) => s.fetchCategories);

  const [searchInput, setSearchInput] = useState(filters.search);
  const isFirstSearchRun = useRef(true);

  // Reset to page one every time History regains focus, so a transaction
  // added or edited elsewhere shows up without a manual pull-to-refresh.
  // Filters are preserved (fetchFirstPage reads them from the store), so
  // navigating away to edit a transaction and back doesn't lose the filter.
  useFocusEffect(
    useCallback(() => {
      fetchFirstPage();
      fetchCategories();
    }, [fetchFirstPage, fetchCategories])
  );

  // Debounce the search box: typing updates the input instantly, but the
  // actual query (and its network round trip) only fires 350ms after the
  // user stops, so fast typing doesn't fire a request per keystroke.
  useEffect(() => {
    if (isFirstSearchRun.current) {
      isFirstSearchRun.current = false;
      return;
    }
    const handle = setTimeout(() => {
      setFilters({ search: searchInput });
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [searchInput, setFilters]);

  const sections = groupTransactionsByDate(transactions);
  const hasActiveFilters =
    filters.year !== null || filters.categoryId !== null || filters.search.trim() !== '';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <MotiView {...motion.slideUp} style={styles.header}>
            <Text style={styles.title}>History</Text>

            <View style={styles.filterRow}>
              <MonthYearFilter
                year={filters.year}
                month={filters.month}
                onChange={(year, month) => setFilters({ year, month })}
              />
            </View>

            <View style={styles.filterRow}>
              <CategoryFilterChips
                categories={categories}
                selectedId={filters.categoryId}
                onSelect={(categoryId) => setFilters({ categoryId })}
              />
            </View>

            <View style={styles.filterRow}>
              <SearchInput value={searchInput} onChangeText={setSearchInput} />
            </View>
          </MotiView>
        }
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>{section.title}</Text>
          </View>
        )}
        renderItem={({ item, index }) => (
          <View style={styles.rowWrapper}>
            <TransactionRow transaction={item} index={index < 8 ? index : 0} navigation={navigation} />
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={isLoading && transactions.length > 0}
            onRefresh={fetchFirstPage}
            tintColor={colors.primary}
          />
        }
        onEndReachedThreshold={0.4}
        onEndReached={fetchNextPage}
        ListFooterComponent={
          isLoadingMore ? (
            <View style={styles.footerLoading}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          isLoading ? (
            <HistorySkeleton />
          ) : error ? (
            <View style={styles.center}>
              <AlertCircle size={32} strokeWidth={1.5} color={colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
              <AnimatedPressable
                onPress={fetchFirstPage}
                haptic="light"
                scaleTo={0.96}
                style={styles.retryButton}
                accessibilityRole="button"
                accessibilityLabel="Retry loading transactions"
              >
                <Text style={styles.retryText}>Retry</Text>
              </AnimatedPressable>
            </View>
          ) : hasActiveFilters ? (
            <MotiView {...motion.fadeIn} delay={120} style={styles.empty}>
              <SearchX size={40} strokeWidth={1.5} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No matching transactions</Text>
              <Text style={styles.emptyHint}>Try a different month, category or search term.</Text>
            </MotiView>
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
      <TransactionListItem transaction={transaction} index={index} />
    </AnimatedPressable>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: FAB_CLEARANCE,
  },
  header: {
    paddingTop: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  filterRow: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    backgroundColor: colors.background,
    paddingVertical: spacing.sm,
  },
  sectionHeaderText: {
    ...typography.label,
    color: colors.textMuted,
  },
  rowWrapper: {
    marginBottom: spacing.sm,
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
