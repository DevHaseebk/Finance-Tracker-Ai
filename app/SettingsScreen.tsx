import { useCallback } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MotiView } from 'moti';
import {
  LogOut,
  Mail,
  Tag,
  Repeat,
  ChevronRight,
  Monitor,
  Sun,
  Moon,
  Wallet,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import AnimatedPressable from '../components/AnimatedPressable';
import { useAuthStore } from '../store/authStore';
import { useThemeStore, type ThemeMode } from '../store/themeStore';
import { useSettingsStore } from '../store/settingsStore';
import { formatCurrency } from '../lib/utils';
import { motion, radius, shadow, spacing, typography, type ThemeColors } from '../lib/theme';
import { useThemedStyles, useTheme } from '../lib/useTheme';
import { FAB_CLEARANCE } from '../components/FloatingActionButton';
import type { RootStackParamList } from '../types';

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: typeof Monitor }[] = [
  { value: 'system', label: 'System', icon: Monitor },
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
];

export default function SettingsScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const themeMode = useThemeStore((s) => s.mode);
  const setThemeMode = useThemeStore((s) => s.setMode);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isSubmitting = useAuthStore((s) => s.isSubmitting);
  const startingBalance = useSettingsStore((s) => s.startingBalance);
  const fetchSettings = useSettingsStore((s) => s.fetchSettings);

  // Refetch on focus so returning from the edit modal shows the saved value
  // without a manual refresh.
  useFocusEffect(
    useCallback(() => {
      fetchSettings();
    }, [fetchSettings])
  );

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

        <MotiView {...motion.cardEntrance} delay={40} style={styles.card}>
          <Text style={styles.sectionLabel}>APPEARANCE</Text>
          <View style={styles.themeTrack}>
            {THEME_OPTIONS.map((option) => {
              const selected = option.value === themeMode;
              const Icon = option.icon;
              return (
                <AnimatedPressable
                  key={option.value}
                  onPress={() => {
                    if (selected) return;
                    Haptics.selectionAsync();
                    setThemeMode(option.value);
                  }}
                  haptic="none"
                  scaleTo={0.96}
                  style={styles.themeSegmentWrapper}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`${option.label} theme`}
                >
                  <View style={[styles.themeSegment, selected && styles.themeSegmentSelected]}>
                    <Icon
                      size={16}
                      strokeWidth={2}
                      color={selected ? colors.textInverse : colors.textSecondary}
                    />
                    <Text
                      style={[styles.themeLabel, selected && styles.themeLabelSelected]}
                    >
                      {option.label}
                    </Text>
                  </View>
                </AnimatedPressable>
              );
            })}
          </View>
        </MotiView>

        <MotiView {...motion.cardEntrance} delay={60}>
          <AnimatedPressable
            onPress={() => navigation.navigate('StartingBalance')}
            haptic="light"
            scaleTo={0.98}
            style={styles.card}
            accessibilityRole="button"
            accessibilityLabel="Edit previous balance"
          >
            <View style={styles.row}>
              <Wallet size={18} strokeWidth={2} color={colors.textSecondary} />
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>PREVIOUS BALANCE</Text>
                <Text style={styles.rowValue}>{formatCurrency(startingBalance)}</Text>
              </View>
              <ChevronRight size={18} strokeWidth={2} color={colors.textMuted} />
            </View>
          </AnimatedPressable>
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

        <MotiView {...motion.cardEntrance} delay={120}>
          <AnimatedPressable
            onPress={() => navigation.navigate('RecurringTransactions')}
            haptic="light"
            scaleTo={0.98}
            style={styles.card}
            accessibilityRole="button"
            accessibilityLabel="Manage recurring transactions"
          >
            <View style={styles.row}>
              <Repeat size={18} strokeWidth={2} color={colors.textSecondary} />
              <View style={styles.rowText}>
                <Text style={styles.rowValue}>Recurring Transactions</Text>
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

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
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
  sectionLabel: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  themeTrack: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  themeSegmentWrapper: { flex: 1 },
  themeSegment: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    height: 40,
    borderRadius: radius.sm,
  },
  themeSegmentSelected: {
    backgroundColor: colors.primary,
  },
  themeLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  themeLabelSelected: {
    color: colors.textInverse,
    fontFamily: 'Inter_600SemiBold',
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
