import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';

import { AppCard } from '@/components/app-card';
import { AppHeader } from '@/components/app-header';
import { AppScreen } from '@/components/app-screen';
import { SectionTitle } from '@/components/section-title';
import { StatusBadge } from '@/components/status-badge';
import { AppColors } from '@/constants/app-theme';
import { clients } from '@/mocks/clients';
import { quotes } from '@/mocks/quotes';
import { formatCurrency, getQuoteSubtotal } from '@/utils/format';

export default function ClientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const client = clients.find((item) => item.id === id) ?? clients[0];
  const clientQuotes = quotes.filter((quote) => quote.clientId === client.id);
  return <AppScreen header={<AppHeader back title={client.name} subtitle="Detalhes do cliente" />}><View style={styles.page}><AppCard><Text style={styles.sectionLabel}>CONTATO</Text><Text style={styles.contact}>{client.phone}</Text><Text style={styles.contact}>{client.email}</Text><Text style={styles.address}>{client.address} · {client.city}/{client.state}</Text></AppCard><View style={styles.metrics}><Metric label="Orçamentos" value={String(client.quoteCount)} /><Metric label="Total movimentado" value={formatCurrency(client.totalValue)} /></View><SectionTitle title="Histórico de orçamentos" />{clientQuotes.length ? clientQuotes.map((quote) => <Link href={{ pathname: '/orcamentos/[id]', params: { id: quote.id } } as never} asChild key={quote.id}><Pressable style={({ pressed }) => pressed && styles.pressed}><AppCard style={styles.quoteCard}><View><Text style={styles.quoteNumber}>Orçamento #{quote.number}</Text><Text style={styles.date}>{quote.createdAt}</Text></View><View style={styles.quoteRight}><Text style={styles.quoteValue}>{formatCurrency(getQuoteSubtotal(quote.items) - quote.discount)}</Text><StatusBadge status={quote.status} /></View></AppCard></Pressable></Link>) : <Text style={styles.empty}>Ainda não há orçamentos para este cliente.</Text>}</View></AppScreen>;
}

function Metric({ label, value }: { label: string; value: string }) { return <AppCard style={styles.metric}><Text style={styles.metricLabel}>{label}</Text><Text style={styles.metricValue} numberOfLines={1}>{value}</Text></AppCard>; }

const styles = StyleSheet.create({ page: { gap: 16 }, sectionLabel: { color: AppColors.primary, fontSize: 10, fontWeight: '800', letterSpacing: 0.8, marginBottom: 10 }, contact: { color: AppColors.ink, fontSize: 14, lineHeight: 21 }, address: { color: AppColors.muted, fontSize: 12, lineHeight: 18, marginTop: 10 }, metrics: { flexDirection: 'row', gap: 10 }, metric: { flex: 1, minWidth: 0 }, metricLabel: { color: AppColors.muted, fontSize: 11, fontWeight: '700' }, metricValue: { color: AppColors.primaryDark, fontSize: 16, fontWeight: '800', marginTop: 8 }, quoteCard: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }, quoteNumber: { color: AppColors.ink, fontSize: 14, fontWeight: '800' }, date: { color: AppColors.muted, fontSize: 12, marginTop: 4 }, quoteRight: { alignItems: 'flex-end', gap: 7 }, quoteValue: { color: AppColors.primaryDark, fontSize: 14, fontWeight: '800' }, empty: { color: AppColors.muted, fontSize: 13, textAlign: 'center' }, pressed: { opacity: 0.72 } });
