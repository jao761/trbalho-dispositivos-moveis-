import { useState } from 'react';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthButton } from '@/components/auth-button';
import { AuthCard } from '@/components/auth-card';
import { AuthInput } from '@/components/auth-input';
import { AuthScreen } from '@/components/auth-screen';
import { AuthColors } from '@/constants/auth-theme';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  return (
    <AuthScreen subtitle="Crie seu acesso em poucos passos" title="Registre-se">
      <AuthCard>
        <Text style={styles.welcome}>Cadastre-se!</Text>
        <Text style={styles.intro}>Organize a gestão comercial da sua empresa.</Text>

        <View style={styles.fields}>
          <AuthInput
            autoCapitalize="words"
            autoComplete="name"
            label="Nome de usuário"
            onChangeText={setName}
            placeholder="Como podemos chamar você?"
            returnKeyType="next"
            value={name}
          />
          <AuthInput
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            keyboardType="email-address"
            label="E-mail"
            onChangeText={setEmail}
            placeholder="nome@empresa.com"
            returnKeyType="next"
            value={email}
          />
          <AuthInput
            autoCapitalize="none"
            autoComplete="new-password"
            label="Senha"
            onChangeText={setPassword}
            placeholder="Crie uma senha"
            secureTextEntry
            value={password}
          />
          <AuthInput
            autoCapitalize="none"
            autoComplete="new-password"
            label="Repita sua senha"
            onChangeText={setPasswordConfirmation}
            placeholder="Repita sua senha"
            secureTextEntry
            value={passwordConfirmation}
          />
        </View>

        <Link href="/" asChild>
          <Pressable accessibilityRole="link" style={({ pressed }) => pressed && styles.textPressed}>
            <Text style={styles.accountLink}>
              Já tem uma conta? <Text style={styles.accountLinkStrong}>Entre aqui</Text>
            </Text>
          </Pressable>
        </Link>

        <AuthButton label="Cadastrar" onPress={() => undefined} />
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
  accountLink: {
    color: AuthColors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
  },
  accountLinkStrong: {
    color: AuthColors.primary,
    fontWeight: '800',
  },
  textPressed: {
    opacity: 0.65,
  },
});
