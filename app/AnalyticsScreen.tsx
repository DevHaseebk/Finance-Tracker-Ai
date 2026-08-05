import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { ChartColumn } from 'lucide-react-native';
import { colors, motion, spacing, typography } from '../lib/theme';
import { FAB_CLEARANCE } from '../components/FloatingActionButton';

export default function AnalyticsScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <MotiView {...motion.slideUp}>
          <Text style={styles.title}>Analytics</Text>
        </MotiView>

        <MotiView {...motion.fadeIn} delay={120} style={styles.empty}>
          <ChartColumn size={40} strokeWidth={1.5} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>Nothing to chart yet</Text>
          <Text style={styles.emptyHint}>
            Spending trends appear here once you have a few transactions.
          </Text>
        </MotiView>
      </ScrollView>
    </SafeAreaView>
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
