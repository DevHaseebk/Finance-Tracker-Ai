import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MotiView } from 'moti';
import { Sparkles, ArrowRight } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import AnimatedPressable from '../components/AnimatedPressable';
import { colors, radius, spacing, typography, motion, staggerDelay } from '../lib/theme';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export default function WelcomeScreen({ navigation }: Props) {
  const handleGetStarted = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Toast.show({
      type: 'success',
      text1: 'Animation pipeline ready',
      text2: 'Reanimated, Moti, gradients & blur all working.',
    });
    navigation.replace('Tabs');
  };

  return (
    <LinearGradient colors={colors.gradient} style={styles.container}>
      {/* Ambient floating orb, purely decorative — confirms looping animations work */}
      <MotiView
        style={styles.orb}
        from={{ opacity: 0.3, scale: 0.9 }}
        animate={{ opacity: 0.6, scale: 1.1 }}
        transition={{
          type: 'timing',
          duration: 2400,
          loop: true,
          repeatReverse: true,
        }}
      />

      <View style={styles.content}>
        <MotiView {...motion.slideUp} delay={staggerDelay(0)}>
          <View style={styles.iconBadge}>
            <Sparkles color={colors.textInverse} size={32} strokeWidth={2} />
          </View>
        </MotiView>

        <MotiView {...motion.slideUp} delay={staggerDelay(1)}>
          <Text style={styles.title}>CashFlow AI</Text>
        </MotiView>

        <MotiView {...motion.slideUp} delay={staggerDelay(2)}>
          <Text style={styles.subtitle}>
            Track spending, spot trends, and stay ahead of your budget — all in one
            beautifully simple place.
          </Text>
        </MotiView>

        <MotiView {...motion.cardEntrance} delay={staggerDelay(3, 80, 200)} style={styles.glassCardWrapper}>
          <BlurView intensity={40} tint="light" style={styles.glassCard}>
            <Text style={styles.glassCardTitle}>This week</Text>
            <Text style={styles.glassCardValue}>$1,284.50</Text>
            <Text style={styles.glassCardHint}>12% less than last week</Text>
          </BlurView>
        </MotiView>

        <MotiView {...motion.fadeIn} delay={staggerDelay(4, 80, 400)} style={styles.ctaWrapper}>
          <AnimatedPressable
            onPress={handleGetStarted}
            haptic="medium"
            style={styles.cta}
            accessibilityRole="button"
            accessibilityLabel="Get started"
          >
            <Text style={styles.ctaText}>Get Started</Text>
            <ArrowRight color={colors.primary} size={20} strokeWidth={2.5} />
          </AnimatedPressable>
        </MotiView>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  orb: {
    position: 'absolute',
    top: '15%',
    right: -60,
    width: 220,
    height: 220,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  content: {
    width: '100%',
    alignItems: 'center',
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: radius.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.display,
    color: colors.textInverse,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  glassCardWrapper: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  glassCard: {
    width: '100%',
    borderRadius: radius.lg,
    padding: spacing.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  glassCardTitle: {
    ...typography.label,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: spacing.xs,
  },
  glassCardValue: {
    ...typography.h1,
    color: colors.textInverse,
    marginBottom: spacing.xs,
  },
  glassCardHint: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.75)',
  },
  ctaWrapper: {
    width: '100%',
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
  },
  ctaText: {
    ...typography.bodyMedium,
    color: colors.primary,
  },
});
