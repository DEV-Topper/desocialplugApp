import '../global.css';

import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { store } from '../store/store';
import { Stack, useRouter, useSegments } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator } from 'react-native';
import { CurrencyProvider } from '../context/CurrencyContext';

function RootLayoutNav() {
  const router = useRouter();
  const segments = useSegments();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const inAuthGroup = segments[0] === '(auth)';
        
        if (!token && !inAuthGroup) {
          router.replace('/(auth)/login');
        } else if (token && inAuthGroup) {
          router.replace('/(dashboard)');
        }
      } catch (err) {
        console.error(err);
      } finally {
         setIsReady(true);
      }
    };
    checkAuth();
  }, [segments]);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(dashboard)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <CurrencyProvider>
        <RootLayoutNav />
      </CurrencyProvider>
    </Provider>
  );
}
