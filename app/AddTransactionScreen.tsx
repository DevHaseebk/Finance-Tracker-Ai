import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { X, AlertCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { format } from 'date-fns';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import AnimatedPressable from '../components/AnimatedPressable';
import TextField from '../components/TextField';
import TypeToggle from '../components/TypeToggle';
import NumberPad from '../components/NumberPad';
import CategoryChipList from '../components/CategoryChipList';
import DatePickerField from '../components/DatePickerField';
import { useCategoryStore } from '../store/categoryStore';
import { useTransactionStore } from '../store/transactionStore';
import { formatCurrency } from '../lib/utils';
import { colors, motion, radius, spacing, typography } from '../lib/theme';
import type { RootStackParamList, TransactionType } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'AddTransaction'>;

const MAX_AMOUNT_CENTS = 99_999_999; // $999,999.99

export default function AddTransactionScreen({ navigation, route }: Props) {
  const transactionId = route.params?.transactionId;
  const isEditing = !!transactionId;

  const categories = useCategoryStore((s) => s.categories);
  const fetchCategories = useCategoryStore((s) => s.fetchCategories);
  const fetchTransactionById = useTransactionStore((s) => s.fetchTransactionById);
  const addTransaction = useTransactionStore((s) => s.addTransaction);
  const updateTransaction = useTransactionStore((s) => s.updateTransaction);
  const isMutating = useTransactionStore((s) => s.isMutating);

  const [isLoading, setIsLoading] = useState(isEditing);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [type, setType] = useState<TransactionType>('expense');
  const [amountCents, setAmountCents] = useState(0);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [date, setDate] = useState<Date>(new Date());
  const [note, setNote] = useState('');

  // Categories may not be loaded yet if this modal is opened before the
  // Categories screen ever was, so always fetch fresh here.
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (!isEditing || !transactionId) return;

    let cancelled = false;
    (async () => {
      const result = await fetchTransactionById(transactionId);
      if (cancelled) return;

      if (result.error || !result.data) {
        setLoadError(result.error ?? 'Transaction not found.');
        setIsLoading(false);
        return;
      }

      const tx = result.data;
      setType(tx.type);
      setAmountCents(Math.round(tx.amount * 100));
      setCategoryId(tx.categoryId);
      setDate(new Date(`${tx.date}T00:00:00`));
      setNote(tx.note ?? '');
      setIsLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [isEditing, transactionId, fetchTransactionById]);

  const filteredCategories = useMemo(
    () => categories.filter((c) => c.type === type && !c.isHidden),
    [categories, type]
  );

  // Auto-select the first available category whenever the current selection
  // doesn't belong to the active type — covers the initial load and every
  // type toggle. This is what makes the flow completable in a couple of taps:
  // type, amount, save, with a sensible category already chosen.
  useEffect(() => {
    if (isLoading) return;
    const stillValid = filteredCategories.some((c) => c.id === categoryId);
    if (!stillValid) {
      setCategoryId(filteredCategories[0]?.id ?? null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredCategories, isLoading]);

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
    setFormError(null);

    if (amountCents <= 0) {
      setFormError('Enter an amount.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    if (!categoryId) {
      setFormError('Choose a category.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    const input = {
      type,
      amount: amountCents / 100,
      categoryId,
      note,
      date: format(date, 'yyyy-MM-dd'),
    };

    const result = isEditing
      ? await updateTransaction(transactionId!, input)
      : await addTransaction(input);

    if (result.error) {
      setFormError(result.error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Toast.show({
      type: 'success',
      text1: isEditing ? 'Transaction updated' : 'Transaction added',
    });
    navigation.goBack();
  };

  const amountColor = type === 'income' ? colors.success : colors.danger;
  const amountSign = type === 'income' ? '+' : '−';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>{isEditing ? 'Edit Transaction' : 'Add Transaction'}</Text>
        <AnimatedPressable
          onPress={() => navigation.goBack()}
          haptic="light"
          scaleTo={0.9}
          style={styles.close}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <X size={20} strokeWidth={2.5} color={colors.textSecondary} />
        </AnimatedPressable>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : loadError ? (
        <View style={styles.center}>
          <AlertCircle size={32} strokeWidth={1.5} color={colors.danger} />
          <Text style={styles.loadErrorText}>{loadError}</Text>
        </View>
      ) : (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {formError ? (
              <MotiView
                from={{ opacity: 0, translateY: -8 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'timing', duration: 200 }}
                style={styles.banner}
              >
                <AlertCircle size={18} strokeWidth={2} color={colors.danger} />
                <Text style={styles.bannerText}>{formError}</Text>
              </MotiView>
            ) : null}

            <TypeToggle value={type} onChange={setType} disabled={isMutating} />

            <View style={styles.amountBlock}>
              <Text style={[styles.amount, { color: amountColor }]} numberOfLines={1}>
                {amountCents > 0 ? amountSign : ''}
                {formatCurrency(amountCents / 100)}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>CATEGORY</Text>
              <CategoryChipList
                categories={filteredCategories}
                selectedId={categoryId}
                onSelect={setCategoryId}
              />
            </View>

            <View style={styles.section}>
              <DatePickerField value={date} onChange={setDate} />
            </View>

            <View style={styles.section}>
              <TextField
                label="NOTE (OPTIONAL)"
                placeholder="Add a note"
                value={note}
                onChangeText={setNote}
                returnKeyType="done"
                maxLength={140}
                editable={!isMutating}
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <AnimatedPressable
              onPress={handleSave}
              disabled={isMutating}
              haptic="medium"
              style={[styles.saveButton, isMutating && styles.saveButtonDisabled]}
              accessibilityRole="button"
              accessibilityLabel={isEditing ? 'Save changes' : 'Add transaction'}
            >
              {isMutating ? (
                <ActivityIndicator color={colors.textInverse} />
              ) : (
                <Text style={styles.saveButtonText}>
                  {isEditing ? 'Save Changes' : 'Add Transaction'}
                </Text>
              )}
            </AnimatedPressable>

            <NumberPad onDigit={handleDigit} onBackspace={handleBackspace} />
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
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
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.dangerLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  bannerText: {
    ...typography.caption,
    color: colors.danger,
    flex: 1,
  },
  amountBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  amount: {
    fontFamily: 'Inter_700Bold',
    fontSize: 52,
  },
  section: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
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
