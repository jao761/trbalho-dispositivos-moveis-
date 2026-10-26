import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AppButton } from '@/components/app-button';
import { AppCard } from '@/components/app-card';
import { AppHeader } from '@/components/app-header';
import { AppScreen } from '@/components/app-screen';
import { AppColors, AppRadius } from '@/constants/app-theme';
import { products } from '@/mocks/products';
import type { QuoteItem } from '@/types/quote';
import { formatCurrency } from '@/utils/format';

export default function QuoteItemsScreen() {
  const router = useRouter();
  const [items, setItems] = useState<QuoteItem[]>([{ id: 'item-001', productId: products[0].id, productName: products[0].name, quantity: 2, unitPrice: products[0].price }, { id: 'item-002', productId: products[1].id, productName: products[1].name, quantity: 5, unitPrice: products[1].price }]);
  const changeQuantity = (id: string, change: number) => setItems((current) => current.map((item) => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + change) } : item));
  const addItem = () => { const next = products.find((product) => !items.some((item) => item.productId === product.id)); if (next) setItems((current) => [...current, { id: `item-${next.id}`, productId: next.id, productName: next.name, quantity: 1, unitPrice: next.price }]); };
  return <AppScreen header={<AppHeader back title="Itens do orçamento" subtitle="Edite quantidades e valores" />}><View style={styles.page}>{items.map((item) => <AppCard key={item.id}><View style={styles.top}><View><Text style={styles.name}>{item.productName}</Text><Text style={styles.unitValue}>{formatCurrency(item.unitPrice)} por unidade</Text></View><Pressable onPress={() => setItems((current) => current.filter((currentItem) => currentItem.id !== item.id))}><Text style={styles.remove}>Remover</Text></Pressable></View><View style={styles.bottom}><View style={styles.counter}><Pressable onPress={() => changeQuantity(item.id, -1)} style={styles.counterButton}><Text style={styles.counterText}>−</Text></Pressable><Text style={styles.quantity}>{item.quantity}</Text><Pressable onPress={() => changeQuantity(item.id, 1)} style={styles.counterButton}><Text style={styles.counterText}>+</Text></Pressable></View><Text style={styles.total}>{formatCurrency(item.quantity * item.unitPrice)}</Text></View></AppCard>)}<AppButton label="Adicionar item" onPress={addItem} variant="secondary" /><AppButton label="Concluir edição" onPress={() => router.back()} /></View></AppScreen>;
}

const styles = StyleSheet.create({ page: { gap: 13 }, top: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between' }, name: { color: AppColors.ink, fontSize: 14, fontWeight: '800' }, unitValue: { color: AppColors.muted, fontSize: 12, marginTop: 5 }, remove: { color: AppColors.danger, fontSize: 11, fontWeight: '800' }, bottom: { alignItems: 'center', borderTopColor: AppColors.line, borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-between', marginTop: 14, paddingTop: 12 }, counter: { alignItems: 'center', backgroundColor: AppColors.infoSoft, borderRadius: AppRadius.pill, flexDirection: 'row', gap: 14, padding: 4 }, counterButton: { alignItems: 'center', backgroundColor: AppColors.surface, borderRadius: 14, height: 28, justifyContent: 'center', width: 28 }, counterText: { color: AppColors.primaryDark, fontSize: 17, fontWeight: '700' }, quantity: { color: AppColors.ink, fontSize: 14, fontWeight: '800' }, total: { color: AppColors.primaryDark, fontSize: 16, fontWeight: '800' } });
