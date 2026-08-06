import { useState } from 'react';
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
import { Mail, Lock, AlertCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import AnimatedPressable from '../components/AnimatedPressable';
import TextField from '../components/TextField';
import { useAuthStore } from '../store/authStore';
import {
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  MIN_PASSWORD_LENGTH,
} from '../lib/validation';
import { motion, radius, spacing, staggerDelay, typography, type ThemeColors } from '../lib/theme';
import { useThemedStyles, useTheme } from '../lib/useTheme';
import type { AuthStackParamList } from '../types';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

export default function SignUpScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const signup = useAuthStore((s) => s.signup);
  const isSubmitting = useAuthStore((s) => s.isSubmitting);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirm?: string;
  }>({});
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const confirmError = validateConfirmPassword(password, confirm);

    setErrors({
      email: emailError ?? undefined,
      password: passwordError ?? undefined,
      confirm: confirmError ?? undefined,
    });
    setFormError(null);

    if (emailError || passwordError || confirmError) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    const { error, needsEmailConfirmation } = await signup(email, password);

    if (error) {
      setFormError(error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (needsEmailConfirmation) {
      // No session yet, so the navigator stays on the auth stack. Send them to
      // Login with a clear explanation rather than leaving them on a dead form.
      Toast.show({
        type: 'success',
        text1: 'Check your inbox',
        text2: 'Confirm your email address, then sign in.',
      });
      navigation.navigate('Login');
      return;
    }

    // Otherwise a session exists and the root navigator swaps to the main app.
    Toast.show({
      type: 'success',
      text1: 'Account created',
      text2: 'Welcome to CashFlow AI.',
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <MotiView {...motion.slideUp} delay={staggerDelay(0)}>
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>
              Start tracking your income and spending in minutes.
            </Text>
          </MotiView>

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

          <MotiView {...motion.slideUp} delay={staggerDelay(1)} style={styles.form}>
            <TextField
              label="EMAIL"
              icon={Mail}
              placeholder="you@example.com"
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                if (errors.email) setErrors((e) => ({ ...e, email: undefined }));
              }}
              error={errors.email}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
              returnKeyType="next"
              editable={!isSubmitting}
            />

            <TextField
              label="PASSWORD"
              icon={Lock}
              placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                if (errors.password) setErrors((e) => ({ ...e, password: undefined }));
              }}
              error={errors.password}
              isPassword
              autoCapitalize="none"
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="next"
              editable={!isSubmitting}
            />

            <TextField
              label="CONFIRM PASSWORD"
              icon={Lock}
              placeholder="Re-enter your password"
              value={confirm}
              onChangeText={(v) => {
                setConfirm(v);
                if (errors.confirm) setErrors((e) => ({ ...e, confirm: undefined }));
              }}
              error={errors.confirm}
              isPassword
              autoCapitalize="none"
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="go"
              onSubmitEditing={handleSubmit}
              editable={!isSubmitting}
            />

            <AnimatedPressable
              onPress={handleSubmit}
              disabled={isSubmitting}
              haptic="medium"
              style={[styles.button, isSubmitting && styles.buttonDisabled]}
              accessibilityRole="button"
              accessibilityLabel="Create account"
            >
              {isSubmitting ? (
                <ActivityIndicator color={colors.textInverse} />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </AnimatedPressable>
          </MotiView>

          <MotiView {...motion.fadeIn} delay={staggerDelay(2, 80, 150)} style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <AnimatedPressable
              onPress={() => navigation.navigate('Login')}
              haptic="light"
              scaleTo={0.94}
              disabled={isSubmitting}
              accessibilityRole="button"
              accessibilityLabel="Sign in"
            >
              <Text style={styles.footerLink}>Sign in</Text>
            </AnimatedPressable>
          </MotiView>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  title: {
    ...typography.display,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
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
  form: { width: '100%' },
  button: {
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    ...typography.bodyMedium,
    color: colors.textInverse,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  footerLink: {
    ...typography.caption,
    color: colors.primary,
    fontFamily: 'Inter_600SemiBold',
  },
});
