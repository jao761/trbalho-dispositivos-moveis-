import type { PropsWithChildren, ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { BottomTabBar, type MainTab } from '@/components/bottom-tab-bar';
import { AppColors } from '@/constants/app-theme';

type AppScreenProps = PropsWithChildren<{
  header: ReactNode;
  activeTab?: MainTab;
  contentStyle?: object;
}>;

export function AppScreen({ header, activeTab, children, contentStyle }: AppScreenProps) {
  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboard}>
        {header}
        <ScrollView contentContainerStyle={[styles.content, contentStyle]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
        {activeTab ? <BottomTabBar active={activeTab} /> : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: AppColors.background, flex: 1 },
  keyboard: { flex: 1 },
  content: { flexGrow: 1, padding: 20, paddingBottom: 32 },
});
