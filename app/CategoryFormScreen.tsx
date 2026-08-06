import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { X, Trash2, AlertCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import AnimatedPressable from '../components/AnimatedPressable';
import TextField from '../components/TextField';
import TypeToggle from '../components/TypeToggle';
import IconPicker from '../components/IconPicker';
import ColorPicker from '../components/ColorPicker';
import { useCategoryStore } from '../store/categoryStore';
import { validateCategoryName } from '../lib/validation';
import { DEFAULT_CATEGORY_ICON, getCategoryIcon } from '../lib/categoryIcons';
import { DEFAULT_CATEGORY_COLOR } from '../lib/categoryColors';
import { colors, motion, radius, spacing, typography } from '../lib/theme';
import type { RootStackParamList, TransactionType } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'CategoryForm'>;

export default function CategoryFormScreen({ navigation, route }: Props) {
  const categoryId = route.params?.categoryId;
  const isEditing = !!categoryId;

  const categories = useCategoryStore((s) => s.categories);
  const addCategory = useCategoryStore((s) => s.addCategory);
  const updateCategory = useCategoryStore((s) => s.updateCategory);
  const deleteCategory = useCategoryStore((s) => s.deleteCategory);
  const isMutating = useCategoryStore((s) => s.isMutating);

  const existing = isEditing ? categories.find((c) => c.id === categoryId) : undefined;

  const [name, setName] = useState(existing?.name ?? '');
  const [type, setType] = useState<TransactionType>(existing?.type ?? 'expense');
  const [icon, setIcon] = useState(existing?.icon ?? DEFAULT_CATEGORY_ICON);
  const [color, setColor] = useState(existing?.color ?? DEFAULT_CATEGORY_COLOR);
  const [nameError, setNameError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Editing a default category should never be reachable from the list, but
  // guard the route directly too in case it's ever deep-linked.
  useEffect(() => {
    if (isEditing && existing?.isDefault) {
      navigation.goBack();
    }
  }, [isEditing, existing, navigation]);

  const PreviewIcon = getCategoryIcon(icon);

  const handleSave = async () => {
    const error = validateCategoryName(name);
    setNameError(error);
    setFormError(null);

    if (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    const input = { name, type, icon, color };
    const result = isEditing
      ? await updateCategory(categoryId!, input)
      : await addCategory(input);

    if (result.error) {
      setFormError(result.error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Toast.show({
      type: 'success',
      text1: isEditing ? 'Category updated' : 'Category added',
    });
    navigation.goBack();
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete category?',
      `"${existing?.name}" will be removed. This can't be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteCategory(categoryId!);
            if (result.error) {
              Toast.show({ type: 'error', text1: 'Could not delete', text2: result.error });
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              return;
            }
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Toast.show({ type: 'success', text1: 'Category deleted' });
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>{isEditing ? 'Edit Category' : 'Add Category'}</Text>
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

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
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

          <MotiView {...motion.cardEntrance} style={styles.previewRow}>
            <View style={[styles.previewBadge, { backgroundColor: color }]}>
              <PreviewIcon size={26} strokeWidth={2} color={colors.textInverse} />
            </View>
            <Text style={styles.previewName} numberOfLines={1}>
              {name.trim() || 'Category name'}
            </Text>
          </MotiView>

          <TextField
            label="NAME"
            placeholder="e.g. Groceries"
            value={name}
            onChangeText={(v) => {
              setName(v);
              if (nameError) setNameError(null);
            }}
            error={nameError}
            autoCapitalize="words"
            returnKeyType="done"
            maxLength={40}
            editable={!isMutating}
          />

          <View style={styles.section}>
            <Text style={styles.label}>TYPE</Text>
            <TypeToggle value={type} onChange={setType} disabled={isMutating} />
          </View>

          <View style={styles.section}>
            <IconPicker value={icon} onChange={setIcon} accentColor={color} />
          </View>

          <View style={styles.section}>
            <ColorPicker value={color} onChange={setColor} />
          </View>

          <AnimatedPressable
            onPress={handleSave}
            disabled={isMutating}
            haptic="medium"
            style={[styles.saveButton, isMutating && styles.saveButtonDisabled]}
            accessibilityRole="button"
            accessibilityLabel={isEditing ? 'Save changes' : 'Add category'}
          >
            {isMutating ? (
              <ActivityIndicator color={colors.textInverse} />
            ) : (
              <Text style={styles.saveButtonText}>
                {isEditing ? 'Save Changes' : 'Add Category'}
              </Text>
            )}
          </AnimatedPressable>

          {isEditing ? (
            <AnimatedPressable
              onPress={handleDelete}
              disabled={isMutating}
              haptic="medium"
              style={styles.deleteButton}
              accessibilityRole="button"
              accessibilityLabel="Delete category"
            >
              <Trash2 size={18} strokeWidth={2} color={colors.danger} />
              <Text style={styles.deleteButtonText}>Delete Category</Text>
            </AnimatedPressable>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingVertical: spacing.lg,
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
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.dangerLight,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  bannerText: {
    ...typography.caption,
    color: colors.danger,
    flex: 1,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  previewBadge: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewName: {
    ...typography.h3,
    color: colors.text,
    flex: 1,
  },
  label: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  section: {
    marginBottom: spacing.xl,
  },
  saveButton: {
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: {
    ...typography.bodyMedium,
    color: colors.textInverse,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 52,
    borderRadius: radius.md,
    marginTop: spacing.md,
  },
  deleteButtonText: {
    ...typography.bodyMedium,
    color: colors.danger,
  },
});
