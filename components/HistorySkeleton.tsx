import { StyleSheet, View } from 'react-native';
import Skeleton from './Skeleton';
import { colors, radius, shadow, spacing } from '../lib/theme';

interface HistorySkeletonProps {
  /** HistoryScreen's filter row is already rendered live above this
   * component (it stays interactive during the first load), so this
   * defaults to false there to avoid showing a duplicate placeholder. */
  showFilters?: boolean;
}

/** Mirrors HistoryScreen's real layout — filter row, section label, a run of
 * transaction rows — shown while the first page is loading. */
export default function HistorySkeleton({ showFilters = false }: HistorySkeletonProps) {
  return (
    <View>
      {showFilters && (
        <>
          <View style={styles.filterRow}>
            <Skeleton width={36} height={32} radius={radius.md} />
            <Skeleton width={110} height={32} radius={radius.md} delay={30} />
            <Skeleton width={36} height={32} radius={radius.md} delay={60} />
          </View>
          <View style={styles.chipRow}>
            {[64, 88, 72, 96].map((w, i) => (
              <Skeleton key={i} width={w} height={32} radius={radius.full} delay={80 + i * 30} />
            ))}
          </View>
          <Skeleton height={44} radius={radius.md} style={styles.mb24} delay={120} />
        </>
      )}

      <Skeleton width={90} height={11} style={styles.mb8} delay={140} />
      <View style={styles.list}>
        {[0, 1, 2, 3, 4].map((i) => (
          <View key={i} style={styles.row}>
            <Skeleton width={36} height={36} radius={radius.md} delay={160 + i * 40} />
            <View style={styles.rowText}>
              <Skeleton width="55%" height={14} style={styles.mb4} delay={160 + i * 40} />
              <Skeleton width={50} height={10} delay={160 + i * 40} />
            </View>
            <Skeleton width={64} height={14} delay={160 + i * 40} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  list: { gap: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    ...shadow.sm,
  },
  rowText: { flex: 1, gap: spacing.xs },
  mb4: { marginBottom: 4 },
  mb8: { marginBottom: spacing.xs },
  mb24: { marginBottom: spacing.lg },
});
