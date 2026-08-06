import { StyleSheet, Text, View } from 'react-native';
import { Delete } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import AnimatedPressable from './AnimatedPressable';
import { colors, fontFamily, fontSize, radius } from '../lib/theme';

interface NumberPadProps {
  onDigit: (digit: string) => void;
  onBackspace: () => void;
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'backspace'];

/**
 * Always-visible numeric keypad for entering an amount, replacing the system
 * keyboard entirely — no text input is ever focused, so no software keyboard
 * can pop up and there's nothing to dismiss.
 */
export default function NumberPad({ onDigit, onBackspace }: NumberPadProps) {
  return (
    <View style={styles.grid}>
      {KEYS.map((key, index) => {
        if (key === '') {
          return <View key={`spacer-${index}`} style={styles.key} />;
        }

        if (key === 'backspace') {
          return (
            <AnimatedPressable
              key={key}
              onPress={() => {
                Haptics.selectionAsync();
                onBackspace();
              }}
              haptic="none"
              scaleTo={0.92}
              style={styles.key}
              accessibilityRole="button"
              accessibilityLabel="Delete last digit"
            >
              <Delete size={22} strokeWidth={2} color={colors.textSecondary} />
            </AnimatedPressable>
          );
        }

        return (
          <AnimatedPressable
            key={key}
            onPress={() => {
              Haptics.selectionAsync();
              onDigit(key);
            }}
            haptic="none"
            scaleTo={0.92}
            style={styles.key}
            accessibilityRole="button"
            accessibilityLabel={`Digit ${key}`}
          >
            <Text style={styles.keyLabel}>{key}</Text>
          </AnimatedPressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  key: {
    width: '33.333%',
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  keyLabel: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.xxl,
    color: colors.text,
  },
});
