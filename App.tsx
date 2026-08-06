import 'react-native-gesture-handler';
import { useCallback, useEffect, useMemo } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import Toast from 'react-native-toast-message';
import RootNavigation from './app/navigation';
import { useAppFonts } from './lib/fonts';
import { useTheme } from './lib/useTheme';
import { useThemeStore } from './store/themeStore';
import { createToastConfig } from './components/toastConfig';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, fontError] = useAppFonts();
  const { colors, isDark } = useTheme();

  const hydrateTheme = useThemeStore((s) => s.hydrate);
  const isHydratingTheme = useThemeStore((s) => s.isHydrating);

  useEffect(() => {
    hydrateTheme();
  }, [hydrateTheme]);

  const toastConfig = useMemo(() => createToastConfig(colors), [colors]);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    onLayoutRootView();
  }, [onLayoutRootView]);

  // Holding the splash until the stored theme is read avoids booting in light
  // and snapping to dark a frame later for someone who picked dark.
  if ((!fontsLoaded && !fontError) || isHydratingTheme) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaProvider>
        <RootNavigation />
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Toast config={toastConfig} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
