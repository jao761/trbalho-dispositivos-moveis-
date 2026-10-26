import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';

import { AppCard } from '@/components/app-card';
import { AppHeader } from '@/components/app-header';
import { AppScreen } from '@/components/app-screen';
import { SearchBar } from '@/components/search-bar';
import { AppColors } from '@/constants/app-theme';
import { clients } from '@/mocks/clients';
import { formatCurrency } from '@/utils/format';

export default function ClientsScreen() {
  const [search, setSearch] = useState('');
  const filteredClients = useMemo(() => clients.filter((client) => client.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()) || client.email.toLocaleLowerCase().includes(search.toLocaleLowerCase())), [search]);

  return <AppScreen activeTab="clientes" header={<AppHeader title="Clientes" subtitle={`${clients.length} clientes cadastrados`} action={<Link href="/clientes/novo" asChild><Pressable accessibilityLabel="Adicionar cliente" style={styles.addButton}><Text style={styles.addLabel}>+</Text></Pressable></Link>} />}><View style={styles.page}><SearchBar onChangeText={setSearch} placeholder="Pesquisar cliente" value={search} /><Text style={styles.result}>{filteredClients.length} {filteredClients.length === 1 ? 'resultado' : 'resultados'}</Text>{filteredClients.map((client) => <Link href={{ pathname: '/clientes/[id]', params: { id: client.id } }} asChild key={client.id}><Pressable style={({ pressed }) => pressed && styles.pressed}><AppCard><View style={styles.cardTop}><View style={styles.initial}><Text style={styles.initialText}>{client.name.slice(0, 1)}</Text></View><View style={styles.clientCopy}><Text style={styles.name}>{client.name}</Text><Text style={styles.detail}>{client.email}</Text><Text style={styles.detail}>{client.phone}</Text></View></View><View style={styles.cardBottom}><Text style={styles.lastQuote}>Último orçamento</Text><Text style={styles.value}>{formatCurrency(client.lastQuoteValue)}</Text></View></AppCard></Pressable></Link>)}</View></AppScreen>;
}

const styles = StyleSheet.create({
  page: { gap: 12 },
  addButton: { alignItems: 'center', backgroundColor: AppColors.primary, borderRadius: 17, height: 34, justifyContent: 'center', width: 34 },
  addLabel: { color: AppColors.surface, fontSize: 22, fontWeight: '400', lineHeight: 24 },
  result: { color: AppColors.muted, fontSize: 12, marginBottom: 2, marginTop: 2 },
  cardTop: { flexDirection: 'row', gap: 12 },
  initial: { alignItems: 'center', backgroundColor: AppColors.infoSoft, borderRadius: 21, height: 42, justifyContent: 'center', width: 42 },
  initialText: { color: AppColors.primary, fontSize: 17, fontWeight: '800' },
  clientCopy: { flex: 1, gap: 3 },
  name: { color: AppColors.ink, fontSize: 15, fontWeight: '800' },
  detail: { color: AppColors.muted, fontSize: 12 },
  cardBottom: { alignItems: 'center', borderTopColor: AppColors.line, borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-between', marginTop: 14, paddingTop: 12 },
  lastQuote: { color: AppColors.muted, fontSize: 12 },
  value: { color: AppColors.primaryDark, fontSize: 14, fontWeight: '800' },
  pressed: { opacity: 0.72 },
});
