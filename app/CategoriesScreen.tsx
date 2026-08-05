import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { ChevronLeft, Tag, AlertCircle } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import AnimatedPressable from '../components/AnimatedPressable';
import { supabase } from '../lib/supabase';
import { colors, motion, radius, shadow, spacing, staggerDelay, typography } from '../lib/theme';
import type { Category, RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Categories'>;

export default function CategoriesScreen({ navigation }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // RLS scopes this to the signed-in user, so no explicit user_id filter.
      const { data, error: queryError } = await supabase
        .from('categories')
        .select('id, name, type, icon, color, is_default')
        .order('type', { ascending: false })
        .order('name');

      if (cancelled) return;

      if (queryError) {
        setError(queryError.message);
      } else {
        setCategories(
          (data ?? []).map((row) => ({
            id: row.id,
            name: row.name,
            type: row.type,
            icon: row.icon ?? undefined,
            color: row.color ?? undefined,
            isDefault: row.is_default,
          }))
        );
      }
      setIsLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <AnimatedPressable
          onPress={() => navigation.goBack()}
          haptic="light"
          scaleTo={0.9}
          style={styles.back}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ChevronLeft size={22} strokeWidth={2.5} color={colors.text} />
        </AnimatedPressable>
        <Text style={styles.title}>Categories</Text>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <AlertCircle size={32} strokeWidth={1.5} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : categories.length === 0 ? (
        <View style={styles.center}>
          <Tag size={36} strokeWidth={1.5} color={colors.textMuted} />
          <Text style={styles.emptyText}>No categories yet.</Text>
        </View>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => (
            <MotiView {...motion.cardEntrance} delay={staggerDelay(index, 40)} style={styles.row}>
              <View style={[styles.swatch, { backgroundColor: item.color ?? colors.border }]} />
              <View style={styles.rowText}>
                <Text style={styles.rowName}>{item.name}</Text>
                <Text style={styles.rowType}>{item.type}</Text>
              </View>
              {item.isDefault ? <Text style={styles.badge}>Default</Text> : null}
            </MotiView>
          )}
        />
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
  back: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.sm,
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
  emptyText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  list: {
    padding: spacing.lg,
    paddingTop: 0,
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.lg,
    ...shadow.sm,
  },
  swatch: {
    width: 12,
    height: 12,
    borderRadius: radius.full,
  },
  rowText: { flex: 1 },
  rowName: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  rowType: {
    ...typography.label,
    color: colors.textMuted,
    textTransform: 'capitalize',
  },
  badge: {
    ...typography.label,
    color: colors.primary,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
});
