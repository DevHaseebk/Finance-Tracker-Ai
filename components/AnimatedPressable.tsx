import { useState, type ReactNode } from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';

interface AnimatedPressableProps extends Omit<PressableProps, 'style'> {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  haptic?: 'light' | 'medium' | 'heavy' | 'none';
  scaleTo?: number;
}

// Wraps any element with Moti's scale-press micro-interaction + haptic feedback.
export default function AnimatedPressable({
  children,
  style,
  haptic = 'light',
  scaleTo = 0.96,
  onPressIn,
  onPress,
  ...pressableProps
}: AnimatedPressableProps) {
  const [pressed, setPressed] = useState(false);

  return (
    <Pressable
      onPressIn={(e) => {
        setPressed(true);
        if (haptic !== 'none') {
          const style =
            haptic === 'heavy'
              ? Haptics.ImpactFeedbackStyle.Heavy
              : haptic === 'medium'
                ? Haptics.ImpactFeedbackStyle.Medium
                : Haptics.ImpactFeedbackStyle.Light;
          Haptics.impactAsync(style);
        }
        onPressIn?.(e);
      }}
      onPressOut={() => setPressed(false)}
      onPress={onPress}
      {...pressableProps}
    >
      <MotiView
        animate={{ scale: pressed ? scaleTo : 1 }}
        transition={{ type: 'timing', duration: 120 }}
        style={style}
      >
        {children}
      </MotiView>
    </Pressable>
  );
}
