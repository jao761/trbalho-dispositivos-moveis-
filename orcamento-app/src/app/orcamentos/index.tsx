import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';

import { AppCard } from '@/components/app-card';
import { AppHeader } from '@/components/app-header';
import { AppScreen } from '@/components/app-screen';
import { StatusBadge } from '@/components/status-badge';
import { AppColors, AppRadius } from '@/constants/app-theme';
import { quotes } from '@/mocks/quotes';
import type { QuoteStatus } from '@/types/quote';
import { formatCurrency, getQuoteSubtotal } from '@/utils/format';

const filters: Array<{ label: string; value: QuoteStatus | 'TODOS' }> = [
  { label: 'Todos', value: 'TODOS' }, { label: 'Rascunhos', value: 'RASCUNHO' }, { label: 'Enviados', value: 'ENVIADO' }, { label: 'Aprovados', value: 'APROVADO' }, { label: 'Recusados', value: 'RECUSADO' }, { label: 'Expirados', value: 'EXPIRADO' },
];

export default function QuotesScreen() {
  const [filter, setFilter] = useState<QuoteStatus | 'TODOS'>('TODOS');
  const filteredQuotes = useMemo(() => filter === 'TODOS' ? quotes : quotes.filter((quote) => quote.status === filter), [filter]);
  return <AppScreen activeTab="orcamentos" header={<AppHeader title="Orçamentos" subtitle={`${quotes.length} propostas no período`} action={<Link href="/orcamentos/novo" asChild><Pressable accessibilityLabel="Novo orçamento" style={styles.addButton}><Text style={styles.addLabel}>+</Text></Pressable></Link>} />}><View style={styles.page}><ScrollView contentContainerStyle={styles.filterList} horizontal showsHorizontalScrollIndicator={false}>{filters.map((item) => <Pressable key={item.value} onPress={() => setFilter(item.value)} style={[styles.filter, filter === item.value && styles.filterActive]}><Text style={[styles.filterLabel, filter === item.value && styles.filterLabelActive]}>{item.label}</Text></Pressable>)}</ScrollView>{filteredQuotes.map((quote) => <Link href={{ pathname: '/orcamentos/[id]', params: { id: quote.id } } as never} asChild key={quote.id}><Pressable style={({ pressed }) => pressed && styles.pressed}><AppCard><View style={styles.top}><View><Text style={styles.number}>#{quote.number}</Text><Text style={styles.client}>{quote.clientName}</Text></View><StatusBadge status={quote.status} /></View><View style={styles.bottom}><Text style={styles.amount}>{formatCurrency(getQuoteSubtotal(quote.items) - quote.discount)}</Text><Text style={styles.date}>{quote.createdAt}</Text></View></AppCard></Pressable></Link>)}</View></AppScreen>;
}

const styles = StyleSheet.create({ page: { gap: 12 }, addButton: { alignItems: 'center', backgroundColor: AppColors.primary, borderRadius: 17, height: 34, justifyContent: 'center', width: 34 }, addLabel: { color: AppColors.surface, fontSize: 22, lineHeight: 24 }, filterList: { gap: 8 }, filter: { backgroundColor: AppColors.surface, borderColor: AppColors.inputBorder, borderRadius: AppRadius.pill, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 9 }, filterActive: { backgroundColor: AppColors.primary, borderColor: AppColors.primary }, filterLabel: { color: AppColors.muted, fontSize: 12, fontWeight: '700' }, filterLabelActive: { color: AppColors.surface }, top: { flexDirection: 'row', justifyContent: 'space-between' }, number: { color: AppColors.primaryDark, fontSize: 15, fontWeight: '800' }, client: { color: AppColors.ink, fontSize: 13, marginTop: 5 }, bottom: { alignItems: 'flex-end', borderTopColor: AppColors.line, borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-between', marginTop: 14, paddingTop: 12 }, amount: { color: AppColors.primaryDark, fontSize: 16, fontWeight: '800' }, date: { color: AppColors.muted, fontSize: 12 }, pressed: { opacity: 0.72 } });
