import { useState } from 'react';
import { Link, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthButton } from '@/components/auth-button';
import { AuthCard } from '@/components/auth-card';
import { AuthInput } from '@/components/auth-input';
import { AuthScreen } from '@/components/auth-screen';
import { AuthColors } from '@/constants/auth-theme';
import { register } from '@/services/auth';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = async () => {
    if (!name.trim() || !companyName.trim() || !email.trim() || !password) {
      setErrorMessage('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (password !== passwordConfirmation) {
      setErrorMessage('As senhas não coincidem.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      await register({
        name: name.trim(),
        company_name: companyName.trim(),
        email: email.trim(),
        password,
        passwordConfirmation,
      });
      router.replace('/inicio' as never);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Falha ao realizar cadastro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreen subtitle="Crie seu acesso em poucos passos" title="Registre-se">
      <AuthCard>
        <Text style={styles.welcome}>Cadastre-se!</Text>
        <Text style={styles.intro}>Organize a gestão comercial da sua empresa.</Text>

        {errorMessage ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        <View style={styles.fields}>
          <AuthInput
            autoCapitalize="words"
            autoComplete="name"
            label="Nome de usuário"
            onChangeText={(text) => {
              setName(text);
              if (errorMessage) setErrorMessage('');
            }}
            placeholder="Como podemos chamar você?"
            returnKeyType="next"
            value={name}
          />
          <AuthInput
            autoCapitalize="words"
            autoComplete="organization"
            label="Nome da empresa"
            onChangeText={(text) => {
              setCompanyName(text);
              if (errorMessage) setErrorMessage('');
            }}
            placeholder="Sua empresa"
            returnKeyType="next"
            value={companyName}
          />
          <AuthInput
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            keyboardType="email-address"
            label="E-mail"
            onChangeText={(text) => {
              setEmail(text);
              if (errorMessage) setErrorMessage('');
            }}
            placeholder="nome@empresa.com"
            returnKeyType="next"
            value={email}
          />
          <AuthInput
            autoCapitalize="none"
            autoComplete="new-password"
            label="Senha"
            onChangeText={(text) => {
              setPassword(text);
              if (errorMessage) setErrorMessage('');
            }}
            placeholder="Crie uma senha (mínimo 6 dígitos)"
            secureTextEntry
            value={password}
          />
          <AuthInput
            autoCapitalize="none"
            autoComplete="new-password"
            label="Repita sua senha"
            onChangeText={(text) => {
              setPasswordConfirmation(text);
              if (errorMessage) setErrorMessage('');
            }}
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

        <AuthButton
          label={loading ? 'Cadastrando...' : 'Cadastrar'}
          onPress={handleRegister}
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
  accountLink: {
    color: AuthColors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 12,
  },
  accountLinkStrong: {
    color: AuthColors.primary,
    fontWeight: '800',
  },
  textPressed: {
    opacity: 0.65,
  },
});
