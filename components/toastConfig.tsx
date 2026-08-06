import { StyleSheet, Text, View } from 'react-native';
import { CircleCheck, CircleAlert } from 'lucide-react-native';
import type { ToastConfig } from 'react-native-toast-message';
import { radius, shadow, spacing, typography, type ThemeColors } from '../lib/theme';

/**
 * The library's default toasts are hardcoded light, so they turn into a white
 * slab in dark mode. These take the active palette instead, and use a coloured
 * leading rule rather than a coloured background so long error messages stay
 * readable.
 */
export function createToastConfig(colors: ThemeColors): ToastConfig {
  const styles = makeStyles(colors);

  const Row = ({
    accent,
    icon,
    text1,
    text2,
  }: {
    accent: string;
    icon: React.ReactNode;
    text1?: string;
    text2?: string;
  }) => (
    <View style={styles.toast}>
      <View style={[styles.accent, { backgroundColor: accent }]} />
      <View style={styles.icon}>{icon}</View>
      <View style={styles.body}>
        {text1 ? (
          <Text style={styles.title} numberOfLines={1}>
            {text1}
          </Text>
        ) : null}
        {text2 ? (
          <Text style={styles.message} numberOfLines={2}>
            {text2}
          </Text>
        ) : null}
      </View>
    </View>
  );

  return {
    success: ({ text1, text2 }) => (
      <Row
        accent={colors.success}
        icon={<CircleCheck size={20} strokeWidth={2} color={colors.success} />}
        text1={text1}
        text2={text2}
      />
    ),
    error: ({ text1, text2 }) => (
      <Row
        accent={colors.danger}
        icon={<CircleAlert size={20} strokeWidth={2} color={colors.danger} />}
        text1={text1}
        text2={text2}
      />
    ),
  };
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    toast: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      width: '92%',
      minHeight: 60,
      paddingRight: spacing.lg,
      borderRadius: radius.md,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
      ...shadow.lg,
    },
    accent: { width: 4, alignSelf: 'stretch' },
    icon: { paddingLeft: spacing.md },
    body: { flex: 1, paddingVertical: spacing.md },
    title: {
      ...typography.bodyMedium,
      color: colors.text,
    },
    message: {
      ...typography.caption,
      color: colors.textSecondary,
      marginTop: 2,
    },
  });
