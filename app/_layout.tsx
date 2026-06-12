import '../src/i18n';
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  useFonts,
  BebasNeue_400Regular,
} from '@expo-google-fonts/bebas-neue';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import {
  Cairo_400Regular,
  Cairo_500Medium,
  Cairo_600SemiBold,
} from '@expo-google-fonts/cairo';
import * as SplashScreen from 'expo-splash-screen';
import { queryClient } from '@/config/queryClient';
import { applyPersistedLanguage } from '@/store/languageStore';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [langReady, setLangReady] = useState(false);

  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Cairo_400Regular,
    Cairo_500Medium,
    Cairo_600SemiBold,
  });

  // Apply persisted language + RTL direction before anything renders
  useEffect(() => {
    applyPersistedLanguage().finally(() => setLangReady(true));
  }, []);

  useEffect(() => {
    if (fontsLoaded && langReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, langReady]);

  if (!fontsLoaded || !langReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }} />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
