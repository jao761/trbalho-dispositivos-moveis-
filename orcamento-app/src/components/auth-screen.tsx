import type { PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { AuthColors } from '@/constants/auth-theme';

type AuthScreenProps = PropsWithChildren<{
  title: string;
  subtitle: string;
}>;

export function AuthScreen({ title, subtitle, children }: AuthScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoidingView}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.heading}>
              <Text style={styles.eyebrow}>ORÇAMENTO APP</Text>
              <Text accessibilityRole="header" style={styles.title}>
                {title}
              </Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AuthColors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  content: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },
  heading: {
    alignItems: 'center',
    marginBottom: 24,
  },
  eyebrow: {
    color: AuthColors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.6,
    marginBottom: 8,
  },
  title: {
    color: AuthColors.ink,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  subtitle: {
    color: AuthColors.muted,
    fontSize: 15,
    marginTop: 6,
  },
});
