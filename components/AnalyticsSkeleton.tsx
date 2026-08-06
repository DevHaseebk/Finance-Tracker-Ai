import { StyleSheet, View } from 'react-native';
import Skeleton from './Skeleton';
import { colors, radius, shadow, spacing } from '../lib/theme';

/** Mirrors AnalyticsScreen's real card layout — range chips, breakdown donut
 * + legend, top spending rows, two chart cards. */
export default function AnalyticsSkeleton() {
  return (
    <View>
      <View style={styles.rangeRow}>
        {[72, 84, 96, 96, 80, 76].map((w, i) => (
          <Skeleton key={i} width={w} height={32} radius={radius.full} delay={i * 30} />
        ))}
      </View>

      <View style={styles.card}>
        <Skeleton width={90} height={16} style={styles.mb16} />
        <Skeleton height={44} radius={radius.md} style={styles.mb16} delay={40} />
        <View style={styles.breakdownBody}>
          <Skeleton width={168} height={168} radius={84} delay={80} />
          <View style={styles.legend}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={styles.legendRow}>
                <Skeleton width={26} height={26} radius={radius.sm} delay={120 + i * 30} />
                <Skeleton width="40%" height={12} delay={120 + i * 30} />
                <Skeleton width={30} height={10} delay={120 + i * 30} />
                <Skeleton width={56} height={14} delay={120 + i * 30} />
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Skeleton width={160} height={16} style={styles.mb16} delay={60} />
        {[0, 1, 2].map((i) => (
          <View key={i} style={styles.topRow}>
            <Skeleton width={14} height={12} delay={100 + i * 30} />
            <Skeleton width={32} height={32} radius={radius.md} delay={100 + i * 30} />
            <View style={styles.flex1}>
              <Skeleton width="70%" height={12} style={styles.mb8} delay={100 + i * 30} />
              <Skeleton height={6} radius={radius.full} delay={100 + i * 30} />
            </View>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Skeleton width={110} height={16} style={styles.mb16} delay={80} />
        <Skeleton height={160} radius={radius.md} delay={120} />
      </View>

      <View style={styles.card}>
        <Skeleton width={130} height={16} style={styles.mb16} delay={100} />
        <Skeleton height={160} radius={radius.md} delay={140} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rangeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadow.card,
  },
  breakdownBody: { alignItems: 'center' },
  legend: {
    width: '100%',
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  flex1: { flex: 1 },
  mb8: { marginBottom: spacing.xs },
  mb16: { marginBottom: spacing.md },
});
