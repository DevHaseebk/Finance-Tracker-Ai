import { useState, forwardRef } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { MotiView } from 'moti';
import { Eye, EyeOff, type LucideIcon } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '../lib/theme';

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string | null;
  icon?: LucideIcon;
  /** Renders a show/hide toggle and masks input by default. */
  isPassword?: boolean;
}

const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, error, icon: Icon, isPassword = false, ...inputProps },
  ref
) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);

  const hasError = !!error;
  const borderColor = hasError
    ? colors.danger
    : focused
      ? colors.primary
      : colors.border;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>

      <View style={[styles.inputRow, { borderColor }]}>
        {Icon ? (
          <Icon
            size={18}
            strokeWidth={2}
            color={hasError ? colors.danger : focused ? colors.primary : colors.textMuted}
          />
        ) : null}

        <TextInput
          ref={ref}
          style={styles.input}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={isPassword && !visible}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...inputProps}
        />

        {isPassword ? (
          <Pressable
            onPress={() => setVisible((v) => !v)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={visible ? 'Hide password' : 'Show password'}
          >
            {visible ? (
              <EyeOff size={18} strokeWidth={2} color={colors.textMuted} />
            ) : (
              <Eye size={18} strokeWidth={2} color={colors.textMuted} />
            )}
          </Pressable>
        ) : null}
      </View>

      {hasError ? (
        <MotiView
          from={{ opacity: 0, translateY: -4 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 180 }}
        >
          <Text style={styles.error}>{error}</Text>
        </MotiView>
      ) : null}
    </View>
  );
});

export default TextField;

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    height: 52,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    // Kills the default Android underline/padding so the row height is exact.
    padding: 0,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
    marginTop: spacing.sm,
  },
});
