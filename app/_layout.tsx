import '../src/i18n';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  useFonts,
  BebasNeue_400Regular,
} from '@expo-google-fonts/bebas-neue';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  Cairo_400Regular,
  Cairo_500Medium,
  Cairo_600SemiBold,
} from '@expo-google-fonts/cairo';
import * as SplashScreen from 'expo-splash-screen';
import { queryClient, asyncStoragePersister } from '@/config/queryClient';
import { applyPersistedLanguage } from '@/store/languageStore';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { installGlobalErrorHandler } from '@/utils/errorLog';

SplashScreen.preventAutoHideAsync();
installGlobalErrorHandler();

export default function RootLayout() {
  const [langReady, setLangReady] = useState(false);

  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
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

  if (!fontsLoaded || !langReady) return <View style={{ flex: 1, backgroundColor: '#0A0A0A' }} />;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <PersistQueryClientProvider client={queryClient} persistOptions={{ persister: asyncStoragePersister }}>
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false }} />
        </PersistQueryClientProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
