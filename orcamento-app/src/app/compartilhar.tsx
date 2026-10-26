import { useEffect, useState } from 'react';
import { ActivityIndicator, Share, StyleSheet, Text, View } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useLocalSearchParams } from 'expo-router';

import { AppButton } from '@/components/app-button';
import { AppCard } from '@/components/app-card';
import { AppHeader } from '@/components/app-header';
import { AppScreen } from '@/components/app-screen';
import { AppColors } from '@/constants/app-theme';
import { getQuote } from '@/services/quotes';
import type { Quote } from '@/types/quote';
import { formatCurrency } from '@/utils/format';

function quoteHtml(quote: Quote) {
  const items = quote.items
    .map((item) => `<tr><td>${item.productName}</td><td>${item.quantity}</td><td>${formatCurrency(item.unitPrice)}</td><td>${formatCurrency(item.quantity * item.unitPrice)}</td></tr>`)
    .join('');
  return `<html><body style="font-family:Arial;padding:32px"><h1>Orçamento #${quote.number}</h1><p>Cliente: ${quote.clientName}</p><table style="width:100%;border-collapse:collapse"><thead><tr><th>Produto</th><th>Qtd.</th><th>Unitário</th><th>Subtotal</th></tr></thead><tbody>${items}</tbody></table><h2>Total: ${formatCurrency(quote.total || 0)}</h2><p>${quote.notes || ''}</p></body></html>`;
}

export default function ShareScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (!id) {
      // The route without an identifier is an invalid document request.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }
    getQuote(id).then(setQuote).catch((error: unknown) => setFeedback(error instanceof Error ? error.message : 'Não foi possível carregar o orçamento.')).finally(() => setLoading(false));
  }, [id]);

  const generatePdf = async () => {
    if (!quote) return;
    const result = await Print.printToFileAsync({ html: quoteHtml(quote) });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(result.uri, { mimeType: 'application/pdf', dialogTitle: 'Compartilhar orçamento' });
      setFeedback('PDF gerado e compartilhado.');
    } else {
      setFeedback(`PDF gerado em ${result.uri}.`);
    }
  };

  const shareText = async () => {
    if (!quote) return;
    await Share.share({ title: `Orçamento #${quote.number}`, message: `Orçamento #${quote.number} para ${quote.clientName}: ${formatCurrency(quote.total || 0)}.` });
    setFeedback('Orçamento enviado para o compartilhamento do dispositivo.');
  };

  if (loading) return <AppScreen header={<AppHeader back title="Compartilhar orçamento" />}><ActivityIndicator color={AppColors.primary} style={styles.loading} /></AppScreen>;
  if (!quote) return <AppScreen header={<AppHeader back title="Compartilhar orçamento" />}><Text style={styles.error}>{feedback || 'Orçamento não encontrado.'}</Text></AppScreen>;

  return <AppScreen header={<AppHeader back title="Compartilhar orçamento" subtitle="Documento comercial" />}><View style={styles.page}><AppCard style={styles.preview}><Text style={styles.previewTitle}>ORÇAMENTO #{quote.number}</Text><Text style={styles.previewCopy}>{quote.clientName} · {formatCurrency(quote.total || 0)}</Text></AppCard><AppButton label="Gerar e compartilhar PDF" onPress={() => void generatePdf()} /><AppButton label="Compartilhar resumo" onPress={() => void shareText()} variant="secondary" />{feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}</View></AppScreen>;
}

const styles = StyleSheet.create({
  page: { gap: 12 },
  loading: { marginTop: 40 },
  preview: { backgroundColor: AppColors.primaryDark },
  previewTitle: { color: AppColors.surface, fontSize: 14, fontWeight: '900' },
  previewCopy: { color: '#D8EDFC', fontSize: 12, marginTop: 5 },
  feedback: { color: AppColors.success, fontSize: 12, textAlign: 'center' },
  error: { color: AppColors.danger, padding: 20 },
});
