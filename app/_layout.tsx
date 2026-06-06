import { useFonts } from 'expo-font';
import { Stack, router } from 'expo-router';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { View } from 'react-native';

import { AppProvider, useApp } from '@/context/AppContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { C } from '@/constants/theme';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') return;
        await Notifications.cancelAllScheduledNotificationsAsync();
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Auswando · Tages-Check-in 🌍',
            body: 'Dein nächster Auswanderungs-Schritt wartet auf dich!',
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: 9,
            minute: 0,
          },
        });
      } catch {
        // expo-notifications not fully supported in Expo Go
      }
    })();
  }, []);

  if (!loaded) return null;

  return (
    <AuthProvider>
      <AppProvider>
        <ThemeProvider value={DefaultTheme}>
          <AppNavigator />
        </ThemeProvider>
      </AppProvider>
    </AuthProvider>
  );
}

function AppNavigator() {
  const { loaded, onboardingSeen } = useApp();
  const { session, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading || !loaded) return;

    if (!session) {
      router.replace('/auth' as any);
    } else if (!onboardingSeen) {
      router.replace('/onboarding' as any);
    } else {
      router.replace('/(tabs)' as any);
    }
  }, [authLoading, loaded, session, onboardingSeen]);

  if (authLoading || !loaded) return <View style={{ flex: 1, backgroundColor: C.bg }} />;

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name="auth/index" options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
