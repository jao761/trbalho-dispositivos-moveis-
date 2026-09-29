import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';

import { AppColors } from '@/constants/app-theme';
import { restoreSession } from '@/services/session';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    void restoreSession().then((isAuthenticated) => {
      if (!mounted) return;
      const isAuthRoute = segments[0] === undefined || segments[0] === 'cadastro';
      if (isAuthenticated && isAuthRoute) router.replace('/inicio');
      if (!isAuthenticated && !isAuthRoute) router.replace('/');
      setIsReady(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!isReady) {
    return <View style={styles.loading}><ActivityIndicator color={AppColors.primary} size="large" /></View>;
  }
  return <Stack screenOptions={{ animation: 'fade', headerShown: false }} />;
}

const styles = StyleSheet.create({
  loading: { alignItems: 'center', backgroundColor: AppColors.background, flex: 1, justifyContent: 'center' },
});
