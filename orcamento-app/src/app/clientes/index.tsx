import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';

import { AppCard } from '@/components/app-card';
import { AppHeader } from '@/components/app-header';
import { AppScreen } from '@/components/app-screen';
import { SearchBar } from '@/components/search-bar';
import { AppColors } from '@/constants/app-theme';
import { listClients } from '@/services/clients';
import type { Client } from '@/types/client';
import { formatCurrency } from '@/utils/format';

export default function ClientsScreen() {
  const [search, setSearch] = useState('');
  const [clientsList, setClientsList] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchClients = async (searchTerm?: string) => {
    setLoading(true);
    try {
      const data = await listClients(searchTerm);
      setClientsList(data);
    } catch (err) {
      console.warn('Erro ao carregar clientes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleSearch = (text: string) => {
    setSearch(text);
    fetchClients(text);
  };

  return (
    <AppScreen
      activeTab="clientes"
      header={
        <AppHeader
          title="Clientes"
          subtitle={`${clientsList.length} clientes cadastrados`}
          action={
            <Link href="/clientes/novo" asChild>
              <Pressable accessibilityLabel="Adicionar cliente" style={styles.addButton}>
                <Text style={styles.addLabel}>+</Text>
              </Pressable>
            </Link>
          }
        />
      }>
      <View style={styles.page}>
        <SearchBar
          onChangeText={handleSearch}
          placeholder="Pesquisar cliente por nome ou e-mail"
          value={search}
        />

        <Text style={styles.result}>
          {clientsList.length} {clientsList.length === 1 ? 'resultado' : 'resultados'}
        </Text>

        {loading && clientsList.length === 0 ? (
          <ActivityIndicator color={AppColors.primary} size="large" style={{ marginVertical: 20 }} />
        ) : null}

        {clientsList.map((client) => (
          <Link
            href={{ pathname: '/clientes/[id]', params: { id: client.id } }}
            asChild
            key={client.id}>
            <Pressable style={({ pressed }) => pressed && styles.pressed}>
              <AppCard>
                <View style={styles.cardTop}>
                  <View style={styles.initial}>
                    <Text style={styles.initialText}>{client.name.slice(0, 1).toUpperCase()}</Text>
                  </View>
                  <View style={styles.clientCopy}>
                    <Text style={styles.name}>{client.name}</Text>
                    {client.email ? <Text style={styles.detail}>{client.email}</Text> : null}
                    {client.phone ? <Text style={styles.detail}>{client.phone}</Text> : null}
                  </View>
                </View>
                <View style={styles.cardBottom}>
                  <Text style={styles.lastQuote}>Último orçamento</Text>
                  <Text style={styles.value}>{formatCurrency(client.lastQuoteValue || 0)}</Text>
                </View>
              </AppCard>
            </Pressable>
          </Link>
        ))}

        {!loading && clientsList.length === 0 ? (
          <Text style={styles.empty}>Nenhum cliente encontrado.</Text>
        ) : null}
      </View>
    </AppScreen>
  );
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
  empty: { color: AppColors.muted, fontSize: 13, textAlign: 'center', marginVertical: 20 },
  pressed: { opacity: 0.72 },
});
