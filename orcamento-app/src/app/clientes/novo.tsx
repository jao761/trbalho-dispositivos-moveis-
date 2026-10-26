import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AppButton } from '@/components/app-button';
import { AppHeader } from '@/components/app-header';
import { AppInput } from '@/components/app-input';
import { AppScreen } from '@/components/app-screen';
import { createClient } from '@/services/clients';

export default function NewClientScreen() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    document: '',
    email: '',
    phone: '',
    address: '',
    number: '',
    complement: '',
    city: '',
    state: '',
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const setValue = (key: keyof typeof form) => (value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (errorMessage) setErrorMessage('');
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setErrorMessage('O nome do cliente é obrigatório.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      await createClient({
        name: form.name.trim(),
        document: form.document.trim() || undefined,
        cpf_cnpj: form.document.trim() || undefined,
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        address: form.address.trim() || undefined,
        number: form.number.trim() || undefined,
        complement: form.complement.trim() || undefined,
        city: form.city.trim() || undefined,
        state: form.state.trim() || undefined,
      });
      router.back();
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha ao salvar cliente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppScreen header={<AppHeader back title="Novo cliente" subtitle="Preencha os dados principais" />}>
      <View style={styles.form}>
        {errorMessage ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        <AppInput
          label="Nome"
          onChangeText={setValue('name')}
          placeholder="Nome completo ou razão social"
          value={form.name}
        />
        <AppInput
          keyboardType="numeric"
          label="CPF/CNPJ"
          onChangeText={setValue('document')}
          placeholder="000.000.000-00"
          value={form.document}
        />
        <AppInput
          autoCapitalize="none"
          keyboardType="email-address"
          label="E-mail"
          onChangeText={setValue('email')}
          placeholder="nome@email.com"
          value={form.email}
        />
        <AppInput
          keyboardType="phone-pad"
          label="Telefone"
          onChangeText={setValue('phone')}
          placeholder="(00) 00000-0000"
          value={form.phone}
        />
        <AppInput
          label="Endereço"
          onChangeText={setValue('address')}
          placeholder="Rua, avenida ou rodovia"
          value={form.address}
        />
        <View style={styles.row}>
          <View style={styles.half}>
            <AppInput
              keyboardType="numeric"
              label="Número"
              onChangeText={setValue('number')}
              placeholder="000"
              value={form.number}
            />
          </View>
          <View style={styles.half}>
            <AppInput
              label="Complemento"
              onChangeText={setValue('complement')}
              placeholder="Apto, sala..."
              value={form.complement}
            />
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.large}>
            <AppInput
              label="Cidade"
              onChangeText={setValue('city')}
              placeholder="Sua cidade"
              value={form.city}
            />
          </View>
          <View style={styles.small}>
            <AppInput
              autoCapitalize="characters"
              label="Estado"
              onChangeText={setValue('state')}
              placeholder="UF"
              value={form.state}
            />
          </View>
        </View>

        <AppButton
          label={loading ? 'Salvando...' : 'Cadastrar cliente'}
          onPress={handleSave}
        />
        <AppButton
          label="Cancelar"
          onPress={() => router.back()}
          style={styles.cancel}
          variant="secondary"
        />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  form: { gap: 4 },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  large: { flex: 2 },
  small: { flex: 1 },
  cancel: { marginTop: 8 },
  errorBox: {
    backgroundColor: '#FDE8E8',
    borderColor: '#F98080',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  errorText: {
    color: '#9B1C1C',
    fontSize: 13,
    fontWeight: '600',
  },
});
