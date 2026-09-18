import { useState } from 'react';
import { Link, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthButton } from '@/components/auth-button';
import { AuthCard } from '@/components/auth-card';
import { AuthInput } from '@/components/auth-input';
import { AuthScreen } from '@/components/auth-screen';
import { AuthColors } from '@/constants/auth-theme';

export default function LoginScreen() {
  const router = useRouter();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <AuthScreen subtitle="Acesse sua conta para continuar" title="Login">
      <AuthCard>
        <Text style={styles.welcome}>Bem-vindo!</Text>
        <Text style={styles.intro}>Entre com seus dados para acompanhar sua operação.</Text>

        <View style={styles.fields}>
          <AuthInput
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="username"
            keyboardType="email-address"
            label="Usuário ou e-mail"
            onChangeText={setUsernameOrEmail}
            placeholder="nome@empresa.com"
            returnKeyType="next"
            value={usernameOrEmail}
          />
          <AuthInput
            autoCapitalize="none"
            autoComplete="current-password"
            label="Senha"
            onChangeText={setPassword}
            placeholder="Digite sua senha"
            secureTextEntry
            value={password}
          />
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => undefined}
          style={({ pressed }) => pressed && styles.textPressed}>
          <Text style={styles.forgotPassword}>Esqueceu sua senha? Clique aqui</Text>
        </Pressable>

        <Link href="/cadastro" asChild>
          <Pressable accessibilityRole="link" style={({ pressed }) => pressed && styles.textPressed}>
            <Text style={styles.accountLink}>
              Ainda não criou uma conta? <Text style={styles.accountLinkStrong}>Entre aqui</Text>
            </Text>
          </Pressable>
        </Link>

        <AuthButton label="Entrar" onPress={() => router.replace('/inicio' as never)} />
      </AuthCard>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  welcome: {
    color: AuthColors.ink,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  intro: {
    color: AuthColors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  fields: {
    marginTop: 28,
  },
  forgotPassword: {
    color: AuthColors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  accountLink: {
    color: AuthColors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 15,
  },
  accountLinkStrong: {
    color: AuthColors.primary,
    fontWeight: '800',
  },
  textPressed: {
    opacity: 0.65,
  },
});
