import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MotiView } from 'moti';
import { LogOut, Mail, Tag, ChevronRight } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import AnimatedPressable from '../components/AnimatedPressable';
import { useAuthStore } from '../store/authStore';
import { colors, motion, radius, shadow, spacing, typography } from '../lib/theme';
import { FAB_CLEARANCE } from '../components/FloatingActionButton';
import type { RootStackParamList } from '../types';

export default function SettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isSubmitting = useAuthStore((s) => s.isSubmitting);

  const handleLogout = async () => {
    const { error } = await logout();
    if (error) {
      Toast.show({ type: 'error', text1: 'Could not sign out', text2: error });
    }
    // On success the root navigator swaps back to the auth stack on its own.
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.title}>Settings</Text>

        <MotiView {...motion.cardEntrance} style={styles.card}>
          <View style={styles.row}>
            <Mail size={18} strokeWidth={2} color={colors.textSecondary} />
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Signed in as</Text>
              <Text style={styles.rowValue} numberOfLines={1}>
                {user?.email ?? '—'}
              </Text>
            </View>
          </View>
        </MotiView>

        <MotiView {...motion.cardEntrance} delay={80}>
          <AnimatedPressable
            onPress={() => navigation.navigate('Categories')}
            haptic="light"
            scaleTo={0.98}
            style={styles.card}
            accessibilityRole="button"
            accessibilityLabel="Manage categories"
          >
            <View style={styles.row}>
              <Tag size={18} strokeWidth={2} color={colors.textSecondary} />
              <View style={styles.rowText}>
                <Text style={styles.rowValue}>Categories</Text>
              </View>
              <ChevronRight size={18} strokeWidth={2} color={colors.textMuted} />
            </View>
          </AnimatedPressable>
        </MotiView>

        <AnimatedPressable
          onPress={handleLogout}
          disabled={isSubmitting}
          haptic="medium"
          style={[styles.logout, isSubmitting && styles.logoutDisabled]}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.danger} />
          ) : (
            <>
              <LogOut size={18} strokeWidth={2} color={colors.danger} />
              <Text style={styles.logoutText}>Sign Out</Text>
            </>
          )}
        </AnimatedPressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: {
    flex: 1,
    padding: spacing.lg,
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
    marginBottom: spacing.lg,
    ...shadow.card,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rowText: { flex: 1 },
  rowLabel: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  rowValue: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.dangerLight,
  },
  logoutDisabled: { opacity: 0.6 },
  logoutText: {
    ...typography.bodyMedium,
    color: colors.danger,
  },
});
