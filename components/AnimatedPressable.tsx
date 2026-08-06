import { useMemo, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';

interface AnimatedPressableProps extends Omit<PressableProps, 'style'> {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  haptic?: 'light' | 'medium' | 'heavy' | 'none';
  scaleTo?: number;
}

/**
 * Style properties that position the button inside its parent's layout. These
 * have to live on the outer Pressable — it's the real child of the parent
 * row/grid, so `flex: 1` or `width: '33%'` on the inner view does nothing and
 * the Pressable silently shrink-wraps to its content instead.
 *
 * Everything else (background, border, padding, shadow, alignment of the
 * button's own children) stays on the inner animated view so the press
 * animation actually scales the visual box.
 */
const LAYOUT_STYLE_KEYS = new Set([
  'flex',
  'flexGrow',
  'flexShrink',
  'flexBasis',
  'alignSelf',
  'width',
  'height',
  'minWidth',
  'maxWidth',
  'minHeight',
  'maxHeight',
  'margin',
  'marginTop',
  'marginBottom',
  'marginLeft',
  'marginRight',
  'marginHorizontal',
  'marginVertical',
  'marginStart',
  'marginEnd',
  'position',
  'top',
  'bottom',
  'left',
  'right',
  'start',
  'end',
  'zIndex',
]);

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

  const [outerStyle, innerStyle] = useMemo(() => {
    const flat = StyleSheet.flatten(style) as Record<string, unknown> | undefined;
    if (!flat) return [undefined, undefined];

    const outer: Record<string, unknown> = {};
    const inner: Record<string, unknown> = {};
    for (const key of Object.keys(flat)) {
      (LAYOUT_STYLE_KEYS.has(key) ? outer : inner)[key] = flat[key];
    }

    // The Pressable is a column flex container, so the inner view already
    // stretches to its width. flexGrow makes it fill a fixed height too (e.g.
    // a 64px keypad key), which keeps the label centred instead of hugging
    // the top.
    inner.flexGrow = 1;

    return [outer as ViewStyle, inner as ViewStyle];
  }, [style]);

  return (
    <Pressable
      style={outerStyle}
      onPressIn={(e) => {
        setPressed(true);
        if (haptic !== 'none') {
          const impact =
            haptic === 'heavy'
              ? Haptics.ImpactFeedbackStyle.Heavy
              : haptic === 'medium'
                ? Haptics.ImpactFeedbackStyle.Medium
                : Haptics.ImpactFeedbackStyle.Light;
          Haptics.impactAsync(impact);
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
        style={innerStyle}
      >
        {children}
      </MotiView>
    </Pressable>
  );
}
