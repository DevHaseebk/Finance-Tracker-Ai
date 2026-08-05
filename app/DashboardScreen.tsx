import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { colors, motion, radius, shadow, spacing, staggerDelay, typography } from '../lib/theme';
import { FAB_CLEARANCE } from '../components/FloatingActionButton';

export default function DashboardScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <MotiView {...motion.slideUp} delay={staggerDelay(0)}>
          <Text style={styles.title}>Dashboard</Text>
        </MotiView>

        <MotiView {...motion.cardEntrance} delay={staggerDelay(1)} style={styles.card}>
          <Text style={styles.cardLabel}>BALANCE</Text>
          <Text style={styles.cardValue}>$0.00</Text>
          <Text style={styles.cardHint}>Add your first transaction to get started.</Text>
        </MotiView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: {
    padding: spacing.lg,
    // Keep the last card clear of the floating action button.
    paddingBottom: FAB_CLEARANCE,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.xl,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.card,
  },
  cardLabel: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  cardValue: {
    ...typography.display,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  cardHint: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
