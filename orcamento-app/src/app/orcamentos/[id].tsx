import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { AppButton } from '@/components/app-button';
import { AppCard } from '@/components/app-card';
import { AppHeader } from '@/components/app-header';
import { AppScreen } from '@/components/app-screen';
import { StatusBadge } from '@/components/status-badge';
import { AppColors } from '@/constants/app-theme';
import { approveQuote, getQuote, rejectQuote } from '@/services/quotes';
import { createOrderFromQuote } from '@/services/orders';
import { getActiveCompany } from '@/services/session';
import type { Quote } from '@/types/quote';
import { formatCurrency, getQuoteSubtotal } from '@/utils/format';

export default function QuoteDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');

  const company = getActiveCompany();

  const loadQuote = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getQuote(id);
      setQuote(data);
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : 'Não foi possível carregar o orçamento.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // The request synchronizes the detail screen with the API.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadQuote();
  }, [id]);

  const handleApprove = async () => {
    if (!quote?.id) return;
    setActionLoading(true);
    setMessage('');
    try {
      const updated = await approveQuote(quote.id);
      setQuote(updated);
      setMessage('Orçamento aprovado com sucesso!');
    } catch (err: unknown) {
      setMessage(`Erro ao aprovar: ${err instanceof Error ? err.message : 'tente novamente.'}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleGenerateOrder = async () => {
    if (!quote?.id) return;
    setActionLoading(true);
    setMessage('');
    try {
      const order = await createOrderFromQuote(quote.id);
      setMessage(`Pedido #${order.number} gerado com sucesso!`);
      router.push('/pedidos' as never);
    } catch (err: unknown) {
      setMessage(`Erro ao gerar pedido: ${err instanceof Error ? err.message : 'tente novamente.'}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!quote?.id) return;
    setActionLoading(true);
    setMessage('');
    try {
      const updated = await rejectQuote(quote.id);
      setQuote(updated);
      setMessage('Orçamento recusado.');
    } catch (err: unknown) {
      setMessage(`Erro ao recusar: ${err instanceof Error ? err.message : 'tente novamente.'}`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !quote) {
    return (
      <AppScreen header={<AppHeader back title="Carregando..." />}>
        <ActivityIndicator color={AppColors.primary} size="large" style={{ marginTop: 40 }} />
      </AppScreen>
    );
  }

  if (!quote || !company) {
    return <AppScreen header={<AppHeader back title="Orçamento" />}><View style={styles.page}><Text style={styles.errorBannerText}>{message || 'Orçamento não encontrado.'}</Text></View></AppScreen>;
  }

  const activeQuote = quote;
  const subtotal = getQuoteSubtotal(activeQuote.items || []);
  const discount = activeQuote.discount || 0;
  const total = activeQuote.total !== undefined ? activeQuote.total : subtotal - discount;

  const isApproved = activeQuote.status === 'APROVADO' || activeQuote.status === 'APPROVED';

  return (
    <AppScreen header={<AppHeader back title={`Orçamento #${activeQuote.number}`} subtitle="Documento comercial" />}>
      <View style={styles.page}>
        {message ? (
          <View style={[styles.infoBanner, message.includes('Erro') && styles.errorBanner]}>
            <Text style={[styles.infoBannerText, message.includes('Erro') && styles.errorBannerText]}>
              {message}
            </Text>
          </View>
        ) : null}

        <AppCard style={styles.document}>
          <View style={styles.documentTop}>
            <View>
              <Text style={styles.documentTitle}>ORÇAMENTO</Text>
              <Text style={styles.company}>{company.name}</Text>
            </View>
            <StatusBadge status={activeQuote.status} />
          </View>

          <View style={styles.info}>
            <Info label="Cliente" value={activeQuote.clientName || 'Cliente'} />
            <Info label="Data" value={activeQuote.createdAt || ''} />
            <Info label="Validade" value={activeQuote.validUntil || '30 dias'} />
          </View>

          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.itemColumn]}>Produto</Text>
            <Text style={styles.tableHeaderText}>Qtd.</Text>
            <Text style={styles.tableHeaderText}>Subtotal</Text>
          </View>

          {(activeQuote.items || []).map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemColumn}>
                <Text style={styles.itemName}>{item.productName}</Text>
                <Text style={styles.itemUnit}>{formatCurrency(item.unitPrice)} un.</Text>
              </View>
              <Text style={styles.itemText}>{item.quantity}</Text>
              <Text style={styles.itemText}>{formatCurrency(item.quantity * item.unitPrice)}</Text>
            </View>
          ))}

          <View style={styles.totals}>
            <TotalLine label="Subtotal" value={formatCurrency(subtotal)} />
            <TotalLine label="Desconto" value={`− ${formatCurrency(discount)}`} />
            <View style={styles.totalLine}>
              <Text style={styles.totalLabel}>TOTAL</Text>
              <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
            </View>
          </View>

          {activeQuote.notes ? (
            <View style={styles.notes}>
              <Text style={styles.notesTitle}>Observações</Text>
              <Text style={styles.notesCopy}>{activeQuote.notes}</Text>
            </View>
          ) : null}
        </AppCard>

        {isApproved ? (
          <AppButton
            label={actionLoading ? 'Gerando pedido...' : 'Converter em Pedido de Venda'}
            onPress={handleGenerateOrder}
          />
        ) : (
          <View style={styles.decisionActions}>
            <AppButton label={actionLoading ? 'Processando...' : 'Aprovar Orçamento'} onPress={handleApprove} style={styles.decisionButton} />
            <AppButton label="Recusar" onPress={handleReject} style={styles.decisionButton} variant="secondary" />
          </View>
        )}

        <View style={styles.actions}>
          <AppButton label="Editar itens" onPress={() => router.push({ pathname: '/orcamentos/itens', params: { id: activeQuote.id } } as never)} style={styles.actionButton} variant="secondary" />
          <AppButton
            label="Gerar PDF"
            onPress={() => router.push({ pathname: '/compartilhar', params: { id: activeQuote.id } } as never)}
            style={styles.actionButton}
          />
          <AppButton
            label="Compartilhar"
            onPress={() => router.push({ pathname: '/compartilhar', params: { id: activeQuote.id } } as never)}
            style={styles.actionButton}
            variant="secondary"
          />
        </View>
      </View>
    </AppScreen>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function TotalLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.totalItem}>
      <Text style={styles.totalItemLabel}>{label}</Text>
      <Text style={styles.totalItemValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { gap: 13 },
  infoBanner: { backgroundColor: '#DEF7EC', borderColor: '#31C48D', borderWidth: 1, borderRadius: 8, padding: 10 },
  infoBannerText: { color: '#03543F', fontSize: 13, fontWeight: '700', textAlign: 'center' },
  errorBanner: { backgroundColor: '#FDE8E8', borderColor: '#F98080' },
  errorBannerText: { color: '#9B1C1C' },
  document: { gap: 18 },
  documentTop: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between' },
  documentTitle: { color: AppColors.primaryDark, fontSize: 20, fontWeight: '900', letterSpacing: 0.7 },
  company: { color: AppColors.muted, fontSize: 13, marginTop: 4 },
  info: { borderBottomColor: AppColors.line, borderBottomWidth: 1, borderTopColor: AppColors.line, borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 13 },
  infoLabel: { color: AppColors.muted, fontSize: 10, fontWeight: '700' },
  infoValue: { color: AppColors.ink, fontSize: 12, fontWeight: '800', marginTop: 4, maxWidth: 105 },
  tableHeader: { flexDirection: 'row' },
  tableHeaderText: { color: AppColors.muted, fontSize: 10, fontWeight: '800', textAlign: 'right', width: 75 },
  itemColumn: { flex: 1, textAlign: 'left', width: 'auto' },
  itemRow: { alignItems: 'flex-start', flexDirection: 'row', paddingVertical: 3 },
  itemName: { color: AppColors.ink, fontSize: 12, fontWeight: '700' },
  itemUnit: { color: AppColors.muted, fontSize: 10, marginTop: 3 },
  itemText: { color: AppColors.ink, fontSize: 11, paddingTop: 2, textAlign: 'right', width: 75 },
  totals: { borderTopColor: AppColors.line, borderTopWidth: 1, gap: 8, paddingTop: 13 },
  totalItem: { flexDirection: 'row', justifyContent: 'space-between' },
  totalItemLabel: { color: AppColors.muted, fontSize: 12 },
  totalItemValue: { color: AppColors.ink, fontSize: 12, fontWeight: '700' },
  totalLine: { borderTopColor: AppColors.line, borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, paddingTop: 12 },
  totalLabel: { color: AppColors.primaryDark, fontSize: 14, fontWeight: '900' },
  totalValue: { color: AppColors.primaryDark, fontSize: 19, fontWeight: '900' },
  notes: { backgroundColor: AppColors.infoSoft, borderRadius: 10, padding: 12 },
  notesTitle: { color: AppColors.primaryDark, fontSize: 11, fontWeight: '800' },
  notesCopy: { color: AppColors.muted, fontSize: 12, lineHeight: 18, marginTop: 5 },
  actions: { flexDirection: 'row', gap: 10 },
  decisionActions: { flexDirection: 'row', gap: 10 },
  decisionButton: { flex: 1, minWidth: 0 },
  actionButton: { flex: 1, minWidth: 0 },
});
