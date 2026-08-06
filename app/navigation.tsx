import { useEffect, useMemo } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import {
  NavigationContainer,
  useNavigation,
  DarkTheme,
  DefaultTheme,
  type Theme as NavTheme,
} from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  createNativeStackNavigator,
  type NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import {
  LayoutDashboard,
  ReceiptText,
  ChartPie,
  Settings as SettingsIcon,
} from 'lucide-react-native';
import type { AuthStackParamList, RootStackParamList, TabParamList } from '../types';
import { fontSize, spacing, type ThemeColors } from '../lib/theme';
import { useThemedStyles, useTheme } from '../lib/useTheme';
import { useAuthStore } from '../store/authStore';
import FloatingActionButton from '../components/FloatingActionButton';
import WelcomeScreen from './WelcomeScreen';
import LoginScreen from './LoginScreen';
import SignUpScreen from './SignUpScreen';
import DashboardScreen from './DashboardScreen';
import HistoryScreen from './HistoryScreen';
import AnalyticsScreen from './AnalyticsScreen';
import SettingsScreen from './SettingsScreen';
import AddTransactionScreen from './AddTransactionScreen';
import CategoriesScreen from './CategoriesScreen';
import CategoryFormScreen from './CategoryFormScreen';
import RecurringTransactionsScreen from './RecurringTransactionsScreen';
import RecurringFormScreen from './RecurringFormScreen';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function Tabs() {
  const { colors } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: 60 + spacing.xl,
          paddingTop: spacing.sm,
          paddingBottom: spacing.xl,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter_500Medium',
          fontSize: fontSize.xs,
        },
      }}
      screenListeners={{
        tabPress: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <LayoutDashboard color={color} size={size} strokeWidth={2} />
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <ReceiptText color={color} size={size} strokeWidth={2} />
          ),
        }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <ChartPie color={color} size={size} strokeWidth={2} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <SettingsIcon color={color} size={size} strokeWidth={2} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

/**
 * The tab navigator plus a FAB layered on top. Keeping the FAB here rather than
 * inside each screen means it stays put across tab switches instead of
 * re-mounting and re-animating every time.
 */
function TabsWithFab() {
  const styles = useThemedStyles(makeStyles);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.flex}>
      <Tabs />
      <FloatingActionButton onPress={() => navigation.navigate('AddTransaction')} />
    </View>
  );
}

function AuthFlow() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
    </AuthStack.Navigator>
  );
}

function AppFlow() {
  return (
    <AppStack.Navigator screenOptions={{ headerShown: false }}>
      <AppStack.Screen name="Tabs" component={TabsWithFab} />
      <AppStack.Screen
        name="AddTransaction"
        component={AddTransactionScreen}
        options={{ presentation: 'modal' }}
      />
      <AppStack.Screen name="Categories" component={CategoriesScreen} />
      <AppStack.Screen
        name="CategoryForm"
        component={CategoryFormScreen}
        options={{ presentation: 'modal' }}
      />
      <AppStack.Screen name="RecurringTransactions" component={RecurringTransactionsScreen} />
      <AppStack.Screen
        name="RecurringForm"
        component={RecurringFormScreen}
        options={{ presentation: 'modal' }}
      />
    </AppStack.Navigator>
  );
}

export default function RootNavigation() {
  const { colors, isDark } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const session = useAuthStore((s) => s.session);
  const isInitializing = useAuthStore((s) => s.isInitializing);
  const initialize = useAuthStore((s) => s.initialize);

  // Restore the persisted session and subscribe to auth changes once.
  useEffect(() => initialize(), [initialize]);

  // Without this the navigator keeps its own default surface colours and
  // flashes white behind every screen transition in dark mode.
  const navTheme = useMemo<NavTheme>(() => {
    const base = isDark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.primary,
        background: colors.background,
        card: colors.card,
        text: colors.text,
        border: colors.border,
      },
    };
  }, [isDark, colors]);

  // Hold on a neutral screen until we know whether a session exists, otherwise
  // returning users get a flash of the login screen on every cold start.
  if (isInitializing) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      {session ? <AppFlow /> : <AuthFlow />}
    </NavigationContainer>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  flex: { flex: 1 },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
