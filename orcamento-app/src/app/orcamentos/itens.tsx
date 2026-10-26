import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { AppButton } from '@/components/app-button';
import { AppCard } from '@/components/app-card';
import { AppHeader } from '@/components/app-header';
import { AppScreen } from '@/components/app-screen';
import { AppColors, AppRadius } from '@/constants/app-theme';
import { deleteQuoteItem, getQuoteItems, updateQuoteItem } from '@/services/quotes';
import type { QuoteItem } from '@/types/quote';
import { formatCurrency } from '@/utils/format';

export default function QuoteItemsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!id) return;
    getQuoteItems(id).then(setItems).catch((error: unknown) => setMessage(error instanceof Error ? error.message : 'Não foi possível carregar os itens.')).finally(() => setLoading(false));
  }, [id]);

  const changeQuantity = async (item: QuoteItem, change: number) => {
    if (!id) return;
    try {
      const updated = await updateQuoteItem(id, item.id, { productId: item.productId, productName: item.productName, quantity: Math.max(1, item.quantity + change), unitPrice: item.unitPrice, discount: 0 });
      setItems((current) => current.map((candidate) => candidate.id === updated.id ? updated : candidate));
    } catch (error: unknown) { setMessage(error instanceof Error ? error.message : 'Não foi possível atualizar o item.'); }
  };
  const removeItem = async (itemId: string) => {
    if (!id) return;
    try { await deleteQuoteItem(id, itemId); setItems((current) => current.filter((item) => item.id !== itemId)); }
    catch (error: unknown) { setMessage(error instanceof Error ? error.message : 'Não foi possível remover o item.'); }
  };

  if (loading) return <AppScreen header={<AppHeader back title="Itens do orçamento" />}><ActivityIndicator color={AppColors.primary} size="large" style={styles.loading} /></AppScreen>;
  return <AppScreen header={<AppHeader back title="Itens do orçamento" subtitle="Alterações são salvas automaticamente" />}><View style={styles.page}>
    {message ? <Text style={styles.error}>{message}</Text> : null}
    {items.map((item) => <AppCard key={item.id}><View style={styles.top}><View><Text style={styles.name}>{item.productName}</Text><Text style={styles.unitValue}>{formatCurrency(item.unitPrice)} por unidade</Text></View><Pressable onPress={() => removeItem(item.id)}><Text style={styles.remove}>Remover</Text></Pressable></View><View style={styles.bottom}><View style={styles.counter}><Pressable onPress={() => changeQuantity(item, -1)} style={styles.counterButton}><Text style={styles.counterText}>−</Text></Pressable><Text style={styles.quantity}>{item.quantity}</Text><Pressable onPress={() => changeQuantity(item, 1)} style={styles.counterButton}><Text style={styles.counterText}>+</Text></Pressable></View><Text style={styles.total}>{formatCurrency(item.quantity * item.unitPrice)}</Text></View></AppCard>)}
    {!items.length ? <Text style={styles.empty}>Este orçamento não tem itens.</Text> : null}
    <Text style={styles.catalogNotice}>Novos itens estarão disponíveis quando a API externa de produtos for integrada.</Text>
    <AppButton label="Concluir edição" onPress={() => router.back()} />
  </View></AppScreen>;
}

const styles = StyleSheet.create({
  page: { gap: 13 }, loading: { marginTop: 40 }, error: { color: AppColors.danger, fontSize: 13, fontWeight: '700' }, top: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between' }, name: { color: AppColors.ink, fontSize: 14, fontWeight: '800' }, unitValue: { color: AppColors.muted, fontSize: 12, marginTop: 5 }, remove: { color: AppColors.danger, fontSize: 11, fontWeight: '800' }, bottom: { alignItems: 'center', borderTopColor: AppColors.line, borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-between', marginTop: 14, paddingTop: 12 }, counter: { alignItems: 'center', backgroundColor: AppColors.infoSoft, borderRadius: AppRadius.pill, flexDirection: 'row', gap: 14, padding: 4 }, counterButton: { alignItems: 'center', backgroundColor: AppColors.surface, borderRadius: 14, height: 28, justifyContent: 'center', width: 28 }, counterText: { color: AppColors.primaryDark, fontSize: 17, fontWeight: '700' }, quantity: { color: AppColors.ink, fontSize: 14, fontWeight: '800' }, total: { color: AppColors.primaryDark, fontSize: 16, fontWeight: '800' }, empty: { color: AppColors.muted, textAlign: 'center' }, catalogNotice: { color: AppColors.muted, fontSize: 12, lineHeight: 18, textAlign: 'center' },
});
