import { Stack } from 'expo-router';

export default function RootLayout() {
  return <Stack screenOptions={{ animation: 'fade', headerShown: false }} />;
}
