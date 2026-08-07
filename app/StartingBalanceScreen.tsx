import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { X, AlertCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import AnimatedPressable from '../components/AnimatedPressable';
import NumberPad from '../components/NumberPad';
import { useSettingsStore } from '../store/settingsStore';
import { formatCurrency } from '../lib/utils';
import { fontSize, motion, radius, spacing, typography, type ThemeColors } from '../lib/theme';
import { useThemedStyles, useTheme } from '../lib/useTheme';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'StartingBalance'>;

const MAX_AMOUNT_CENTS = 99_999_999; // Rs 999,999.99

/**
 * A balance carried in from before the user started tracking here — not a
 * transaction, so it never appears in History or the category breakdowns. It
 * only folds into Dashboard's total balance and the Analytics savings trend
 * as a baseline (see get_dashboard_summary / get_savings_trend).
 */
export default function StartingBalanceScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);

  const startingBalance = useSettingsStore((s) => s.startingBalance);
  const isLoading = useSettingsStore((s) => s.isLoading);
  const loadError = useSettingsStore((s) => s.error);
  const isMutating = useSettingsStore((s) => s.isMutating);
  const fetchSettings = useSettingsStore((s) => s.fetchSettings);
  const updateStartingBalance = useSettingsStore((s) => s.updateStartingBalance);

  const [amountCents, setAmountCents] = useState(0);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Prefill once the stored value has loaded, without clobbering digits the
  // user has already typed if this effect re-runs for any reason.
  useEffect(() => {
    if (!isLoading && !initialized) {
      setAmountCents(Math.round(startingBalance * 100));
      setInitialized(true);
    }
  }, [isLoading, initialized, startingBalance]);

  const handleDigit = (digit: string) => {
    setAmountCents((prev) => {
      const next = prev * 10 + Number(digit);
      return next > MAX_AMOUNT_CENTS ? prev : next;
    });
  };

  const handleBackspace = () => {
    setAmountCents((prev) => Math.floor(prev / 10));
  };

  const handleSave = async () => {
    const result = await updateStartingBalance(amountCents / 100);

    if (result.error) {
      Toast.show({ type: 'error', text1: 'Could not save', text2: result.error });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Toast.show({ type: 'success', text1: 'Previous balance saved' });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Previous Balance</Text>
        <AnimatedPressable
          onPress={() => navigation.goBack()}
          haptic="light"
          scaleTo={0.9}
          style={styles.close}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <X size={20} strokeWidth={2.5} color={colors.textSecondary} />
        </AnimatedPressable>
      </View>

      {isLoading && !initialized ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : loadError && !initialized ? (
        <View style={styles.center}>
          <AlertCircle size={32} strokeWidth={1.5} color={colors.danger} />
          <Text style={styles.loadErrorText}>{loadError}</Text>
        </View>
      ) : (
        <>
          <MotiView {...motion.fadeIn} style={styles.hint}>
            <Text style={styles.hintText}>
              The balance you already had before you started tracking here.
              It's added to your total balance — not shown as a transaction.
            </Text>
          </MotiView>

          <View style={styles.amountBlock}>
            <Text style={styles.amount} numberOfLines={1}>
              {formatCurrency(amountCents / 100)}
            </Text>
          </View>

          <View style={styles.footer}>
            <AnimatedPressable
              onPress={handleSave}
              disabled={isMutating}
              haptic="medium"
              style={[styles.saveButton, isMutating && styles.saveButtonDisabled]}
              accessibilityRole="button"
              accessibilityLabel="Save previous balance"
            >
              {isMutating ? (
                <ActivityIndicator color={colors.textInverse} />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </AnimatedPressable>

            <NumberPad onDigit={handleDigit} onBackspace={handleBackspace} />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    title: {
      ...typography.h2,
      color: colors.text,
    },
    close: {
      width: 36,
      height: 36,
      borderRadius: radius.full,
      backgroundColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.md,
      paddingHorizontal: spacing.xl,
    },
    loadErrorText: {
      ...typography.caption,
      color: colors.danger,
      textAlign: 'center',
    },
    hint: {
      paddingHorizontal: spacing.xl,
    },
    hintText: {
      ...typography.caption,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 18,
    },
    amountBlock: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    amount: {
      fontFamily: 'Inter_700Bold',
      fontSize: fontSize.jumbo,
      color: colors.text,
    },
    footer: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.sm,
    },
    saveButton: {
      height: 52,
      borderRadius: radius.md,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.sm,
    },
    saveButtonDisabled: { opacity: 0.6 },
    saveButtonText: {
      ...typography.bodyMedium,
      color: colors.textInverse,
    },
  });
