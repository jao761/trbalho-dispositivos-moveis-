import { useState } from 'react';
import { Link, useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthButton } from '@/components/auth-button';
import { AuthCard } from '@/components/auth-card';
import { AuthInput } from '@/components/auth-input';
import { AuthScreen } from '@/components/auth-screen';
import { AuthColors } from '@/constants/auth-theme';
import { login } from '@/services/auth';

export default function LoginScreen() {
  const router = useRouter();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    if (!usernameOrEmail.trim() || !password) {
      setErrorMessage('Por favor, informe seu e-mail e sua senha.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      await login({
        usernameOrEmail: usernameOrEmail.trim(),
        password,
      });
      router.replace('/inicio' as never);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Erro ao realizar login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreen subtitle="Acesse sua conta para continuar" title="Login">
      <AuthCard>
        <Text style={styles.welcome}>Bem-vindo!</Text>
        <Text style={styles.intro}>Entre com seus dados para acompanhar sua operação.</Text>

        {errorMessage ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        <View style={styles.fields}>
          <AuthInput
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="username"
            keyboardType="email-address"
            label="Usuário ou e-mail"
            onChangeText={(text) => {
              setUsernameOrEmail(text);
              if (errorMessage) setErrorMessage('');
            }}
            placeholder="nome@empresa.com"
            returnKeyType="next"
            value={usernameOrEmail}
          />
          <AuthInput
            autoCapitalize="none"
            autoComplete="current-password"
            label="Senha"
            onChangeText={(text) => {
              setPassword(text);
              if (errorMessage) setErrorMessage('');
            }}
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

        <AuthButton
          label={loading ? 'Entrando...' : 'Entrar'}
          onPress={handleLogin}
        />
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
  errorBox: {
    backgroundColor: '#FDE8E8',
    borderColor: '#F98080',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginTop: 14,
  },
  errorText: {
    color: '#9B1C1C',
    fontSize: 13,
    fontWeight: '600',
  },
  fields: {
    marginTop: 20,
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
