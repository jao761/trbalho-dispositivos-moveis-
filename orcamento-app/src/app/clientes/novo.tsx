import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AppButton } from '@/components/app-button';
import { AppHeader } from '@/components/app-header';
import { AppInput } from '@/components/app-input';
import { AppScreen } from '@/components/app-screen';

export default function NewClientScreen() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', document: '', email: '', phone: '', address: '', number: '', complement: '', city: '', state: '' });
  const setValue = (key: keyof typeof form) => (value: string) => setForm((current) => ({ ...current, [key]: value }));
  return <AppScreen header={<AppHeader back title="Novo cliente" subtitle="Preencha os dados principais" />}><View style={styles.form}><AppInput label="Nome" onChangeText={setValue('name')} placeholder="Nome completo ou razão social" value={form.name} /><AppInput keyboardType="numeric" label="CPF/CNPJ" onChangeText={setValue('document')} placeholder="000.000.000-00" value={form.document} /><AppInput autoCapitalize="none" keyboardType="email-address" label="E-mail" onChangeText={setValue('email')} placeholder="nome@email.com" value={form.email} /><AppInput keyboardType="phone-pad" label="Telefone" onChangeText={setValue('phone')} placeholder="(00) 00000-0000" value={form.phone} /><AppInput label="Endereço" onChangeText={setValue('address')} placeholder="Rua, avenida ou rodovia" value={form.address} /><View style={styles.row}><View style={styles.half}><AppInput keyboardType="numeric" label="Número" onChangeText={setValue('number')} placeholder="000" value={form.number} /></View><View style={styles.half}><AppInput label="Complemento" onChangeText={setValue('complement')} placeholder="Apto, sala..." value={form.complement} /></View></View><View style={styles.row}><View style={styles.large}><AppInput label="Cidade" onChangeText={setValue('city')} placeholder="Sua cidade" value={form.city} /></View><View style={styles.small}><AppInput autoCapitalize="characters" label="Estado" onChangeText={setValue('state')} placeholder="UF" value={form.state} /></View></View><AppButton label="Cadastrar cliente" onPress={() => router.back()} /><AppButton label="Cancelar" onPress={() => router.back()} style={styles.cancel} variant="secondary" /></View></AppScreen>;
}

const styles = StyleSheet.create({ form: { gap: 2 }, row: { flexDirection: 'row', gap: 12 }, half: { flex: 1 }, large: { flex: 2 }, small: { flex: 1 }, cancel: { marginTop: 10 } });
