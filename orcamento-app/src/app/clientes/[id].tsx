import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';

import { AppCard } from '@/components/app-card';
import { AppHeader } from '@/components/app-header';
import { AppScreen } from '@/components/app-screen';
import { SectionTitle } from '@/components/section-title';
import { StatusBadge } from '@/components/status-badge';
import { AppColors } from '@/constants/app-theme';
import { getClient, getClientQuotes } from '@/services/clients';
import type { Client } from '@/types/client';
import type { Quote } from '@/types/quote';
import { formatCurrency, getQuoteSubtotal } from '@/utils/format';

export default function ClientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [clientQuotes, setClientQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadClientData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [cData, qData] = await Promise.all([
          getClient(id),
          getClientQuotes(id).catch(() => []),
        ]);
        if (isMounted) {
          setClient(cData);
          setClientQuotes(qData);
        }
      } catch (err: unknown) {
        console.warn('Erro ao carregar detalhes do cliente:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadClientData();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading && !client) {
    return (
      <AppScreen header={<AppHeader back title="Carregando..." />}>
        <ActivityIndicator color={AppColors.primary} size="large" style={{ marginTop: 40 }} />
      </AppScreen>
    );
  }

  if (!client) {
    return <AppScreen header={<AppHeader back title="Cliente" />}><View style={styles.page}><Text style={styles.empty}>Não foi possível carregar este cliente.</Text></View></AppScreen>;
  }
  const activeClient = client;

  return (
    <AppScreen header={<AppHeader back title={activeClient.name} subtitle="Detalhes do cliente" />}>
      <View style={styles.page}>
        <AppCard>
          <Text style={styles.sectionLabel}>CONTATO</Text>
          <Text style={styles.contact}>{activeClient.phone || 'Sem telefone'}</Text>
          <Text style={styles.contact}>{activeClient.email || 'Sem e-mail'}</Text>
          <Text style={styles.address}>
            {[activeClient.address, activeClient.city, activeClient.state].filter(Boolean).join(' · ') || 'Endereço não informado'}
          </Text>
        </AppCard>

        <View style={styles.metrics}>
          <Metric label="Orçamentos" value={String(activeClient.quoteCount || clientQuotes.length)} />
          <Metric label="Total movimentado" value={formatCurrency(activeClient.totalValue || 0)} />
        </View>

        <SectionTitle title="Histórico de orçamentos" />
        {clientQuotes.length ? (
          clientQuotes.map((quote) => (
            <Link
              href={{ pathname: '/orcamentos/[id]', params: { id: quote.id } } as never}
              asChild
              key={quote.id}>
              <Pressable style={({ pressed }) => pressed && styles.pressed}>
                <AppCard style={styles.quoteCard}>
                  <View>
                    <Text style={styles.quoteNumber}>Orçamento #{quote.number}</Text>
                    <Text style={styles.date}>{quote.createdAt}</Text>
                  </View>
                  <View style={styles.quoteRight}>
                    <Text style={styles.quoteValue}>
                      {formatCurrency(getQuoteSubtotal(quote.items) - (quote.discount || 0))}
                    </Text>
                    <StatusBadge status={quote.status} />
                  </View>
                </AppCard>
              </Pressable>
            </Link>
          ))
        ) : (
          <Text style={styles.empty}>Ainda não há orçamentos para este cliente.</Text>
        )}
      </View>
    </AppScreen>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <AppCard style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue} numberOfLines={1}>
        {value}
      </Text>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  page: { gap: 16 },
  sectionLabel: { color: AppColors.primary, fontSize: 10, fontWeight: '800', letterSpacing: 0.8, marginBottom: 10 },
  contact: { color: AppColors.ink, fontSize: 14, lineHeight: 21 },
  address: { color: AppColors.muted, fontSize: 12, lineHeight: 18, marginTop: 10 },
  metrics: { flexDirection: 'row', gap: 10 },
  metric: { flex: 1, minWidth: 0 },
  metricLabel: { color: AppColors.muted, fontSize: 11, fontWeight: '700' },
  metricValue: { color: AppColors.primaryDark, fontSize: 16, fontWeight: '800', marginTop: 8 },
  quoteCard: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  quoteNumber: { color: AppColors.ink, fontSize: 14, fontWeight: '800' },
  date: { color: AppColors.muted, fontSize: 12, marginTop: 4 },
  quoteRight: { alignItems: 'flex-end', gap: 7 },
  quoteValue: { color: AppColors.primaryDark, fontSize: 14, fontWeight: '800' },
  empty: { color: AppColors.muted, fontSize: 13, textAlign: 'center' },
  pressed: { opacity: 0.72 },
});
