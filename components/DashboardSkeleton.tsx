import { StyleSheet, View } from 'react-native';
import Skeleton from './Skeleton';
import { radius, shadow, spacing, type ThemeColors } from '../lib/theme';
import { useThemedStyles } from '../lib/useTheme';

/** Mirrors DashboardScreen's real layout — balance card, quick actions, this
 * month card, recent transactions — so the swap from skeleton to real
 * content doesn't visually jump. */
export default function DashboardSkeleton() {
  const styles = useThemedStyles(makeStyles);
  return (
    <View>
      <View style={styles.card}>
        <Skeleton width={90} height={11} style={styles.mb8} />
        <Skeleton width={180} height={34} style={styles.mb8} />
        <Skeleton width={220} height={13} delay={80} />
      </View>

      <View style={styles.quickActions}>
        <Skeleton height={48} radius={radius.md} style={styles.flex1} delay={120} />
        <Skeleton height={48} radius={radius.md} style={styles.flex1} delay={160} />
      </View>

      <View style={styles.card}>
        <Skeleton width={90} height={11} style={styles.mb16} delay={100} />
        <View style={styles.statsRow}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={styles.statItem}>
              <Skeleton width={32} height={32} radius={radius.md} style={styles.mb8} delay={140 + i * 40} />
              <Skeleton width={48} height={10} style={styles.mb4} delay={140 + i * 40} />
              <Skeleton width={64} height={16} delay={140 + i * 40} />
            </View>
          ))}
        </View>
      </View>

      <Skeleton width={140} height={11} style={styles.mb8} delay={160} />
      <View style={styles.list}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={styles.row}>
            <Skeleton width={36} height={36} radius={radius.md} delay={180 + i * 40} />
            <View style={styles.rowText}>
              <Skeleton width="60%" height={14} style={styles.mb4} delay={180 + i * 40} />
              <Skeleton width={50} height={10} delay={180 + i * 40} />
            </View>
            <Skeleton width={64} height={14} delay={180 + i * 40} />
          </View>
        ))}
      </View>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadow.card,
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  flex1: { flex: 1 },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: { flex: 1, alignItems: 'flex-start' },
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
  mb16: { marginBottom: spacing.md },
});
