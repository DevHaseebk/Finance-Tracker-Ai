import { useCallback, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { MotiView } from 'moti';
import { ChevronLeft, ChevronRight, Plus, Tag, AlertCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import AnimatedPressable from '../components/AnimatedPressable';
import { useCategoryStore } from '../store/categoryStore';
import { getCategoryIcon } from '../lib/categoryIcons';
import { colors, motion, radius, shadow, spacing, staggerDelay, typography } from '../lib/theme';
import type { Category, RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Categories'>;

export default function CategoriesScreen({ navigation }: Props) {
  const categories = useCategoryStore((s) => s.categories);
  const isLoading = useCategoryStore((s) => s.isLoading);
  const error = useCategoryStore((s) => s.error);
  const fetchCategories = useCategoryStore((s) => s.fetchCategories);
  const setHidden = useCategoryStore((s) => s.setHidden);

  // Refetch whenever the screen regains focus, so edits/adds/deletes made on
  // CategoryFormScreen are reflected without a manual pull-to-refresh.
  useFocusEffect(
    useCallback(() => {
      fetchCategories();
    }, [fetchCategories])
  );

  const income = categories.filter((c) => c.type === 'income');
  const expense = categories.filter((c) => c.type === 'expense');

  const handleToggleHidden = async (category: Category) => {
    Haptics.selectionAsync();
    const result = await setHidden(category.id, !category.isHidden);
    if (result.error) {
      Toast.show({ type: 'error', text1: 'Could not update category', text2: result.error });
    }
  };

  const confirmDelete = (category: Category) => {
    Alert.alert('Delete category?', `"${category.name}" will be removed. This can't be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const result = await useCategoryStore.getState().deleteCategory(category.id);
          if (result.error) {
            Toast.show({ type: 'error', text1: 'Could not delete', text2: result.error });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Toast.show({ type: 'success', text1: 'Category deleted' });
          }
        },
      },
    ]);
  };

  const renderRow = (category: Category, index: number) => {
    const Icon = getCategoryIcon(category.icon);

    return (
      <MotiView
        key={category.id}
        {...motion.cardEntrance}
        delay={staggerDelay(index, 30)}
        style={[styles.row, category.isHidden && styles.rowHidden]}
      >
        <View style={[styles.swatch, { backgroundColor: category.color ?? colors.border }]}>
          <Icon size={18} strokeWidth={2} color={colors.textInverse} />
        </View>

        <View style={styles.rowText}>
          <Text style={styles.rowName} numberOfLines={1}>
            {category.name}
          </Text>
          {category.isDefault ? <Text style={styles.rowMeta}>Default</Text> : null}
          {category.isHidden ? <Text style={styles.rowMeta}>Hidden</Text> : null}
        </View>

        {category.isDefault ? (
          <Switch
            value={!category.isHidden}
            onValueChange={() => handleToggleHidden(category)}
            trackColor={{ false: colors.border, true: colors.primaryLight }}
            thumbColor={category.isHidden ? colors.textMuted : colors.primary}
            accessibilityLabel={`${category.isHidden ? 'Show' : 'Hide'} ${category.name}`}
          />
        ) : (
          <View style={styles.rowActions}>
            <AnimatedPressable
              onPress={() => navigation.navigate('CategoryForm', { categoryId: category.id })}
              haptic="light"
              scaleTo={0.85}
              style={styles.actionButton}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`Edit ${category.name}`}
            >
              <ChevronRight size={18} strokeWidth={2} color={colors.textMuted} />
            </AnimatedPressable>
          </View>
        )}
      </MotiView>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <AnimatedPressable
          onPress={() => navigation.goBack()}
          haptic="light"
          scaleTo={0.9}
          style={styles.headerButton}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ChevronLeft size={22} strokeWidth={2.5} color={colors.text} />
        </AnimatedPressable>
        <Text style={styles.title}>Categories</Text>
        <AnimatedPressable
          onPress={() => navigation.navigate('CategoryForm', undefined)}
          haptic="medium"
          scaleTo={0.9}
          style={[styles.headerButton, styles.addButton]}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Add category"
        >
          <Plus size={20} strokeWidth={2.5} color={colors.textInverse} />
        </AnimatedPressable>
      </View>

      {isLoading && categories.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <AlertCircle size={32} strokeWidth={1.5} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
          <AnimatedPressable
            onPress={fetchCategories}
            haptic="light"
            scaleTo={0.96}
            style={styles.retryButton}
            accessibilityRole="button"
            accessibilityLabel="Retry loading categories"
          >
            <Text style={styles.retryText}>Retry</Text>
          </AnimatedPressable>
        </View>
      ) : categories.length === 0 ? (
        <View style={styles.center}>
          <Tag size={36} strokeWidth={1.5} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No categories yet</Text>
          <Text style={styles.emptyHint}>
            Tap the + button above to create your first category.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {income.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>INCOME</Text>
              <View style={styles.sectionList}>
                {income.map((c, i) => renderRow(c, i))}
              </View>
            </View>
          ) : null}

          {expense.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>EXPENSE</Text>
              <View style={styles.sectionList}>
                {expense.map((c, i) => renderRow(c, i))}
              </View>
            </View>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.sm,
  },
  addButton: {
    backgroundColor: colors.primary,
    marginLeft: 'auto',
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
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
  list: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  sectionList: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    ...shadow.sm,
  },
  rowHidden: {
    opacity: 0.5,
  },
  swatch: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1 },
  rowName: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  rowMeta: {
    ...typography.label,
    color: colors.textMuted,
    marginTop: 2,
  },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
