import { StyleSheet, Text, View } from 'react-native';
import { MotiView } from 'moti';
import { Repeat } from 'lucide-react-native';
import { getCategoryIcon } from '../lib/categoryIcons';
import { formatDate, signedAmount } from '../lib/utils';
import { colors, motion, radius, shadow, spacing, staggerDelay, typography } from '../lib/theme';
import type { TransactionWithCategory } from '../types';

interface TransactionListItemProps {
  transaction: TransactionWithCategory;
  /** Used to stagger the entrance animation; omit to skip staggering. */
  index?: number;
}

/** A single transaction row — category icon/color, name, date, signed amount.
 * Shows a small repeat icon next to the name when the transaction was
 * auto-generated from a recurring rule (transaction.recurringId is set). */
export default function TransactionListItem({ transaction, index = 0 }: TransactionListItemProps) {
  const Icon = getCategoryIcon(transaction.categoryIcon);
  const tint = transaction.categoryColor ?? colors.primary;

  return (
    <MotiView {...motion.cardEntrance} delay={staggerDelay(index, 30)} style={styles.row}>
      <View style={[styles.swatch, { backgroundColor: tint }]}>
        <Icon size={16} strokeWidth={2} color={colors.textInverse} />
      </View>

      <View style={styles.text}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {transaction.categoryName}
          </Text>
          {transaction.recurringId ? (
            <Repeat
              size={12}
              strokeWidth={2.5}
              color={colors.textMuted}
              accessibilityLabel="Recurring transaction"
            />
          ) : null}
        </View>
        <Text style={styles.date}>{formatDate(transaction.date, 'MMM d')}</Text>
      </View>

      <Text
        style={[
          styles.amount,
          { color: transaction.type === 'income' ? colors.success : colors.danger },
        ]}
        numberOfLines={1}
      >
        {signedAmount(transaction.amount, transaction.type)}
      </Text>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    ...shadow.sm,
  },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  name: {
    ...typography.bodyMedium,
    color: colors.text,
    flexShrink: 1,
  },
  date: {
    ...typography.label,
    color: colors.textMuted,
    marginTop: 2,
  },
  amount: {
    ...typography.bodyMedium,
    fontFamily: 'Inter_600SemiBold',
  },
});
