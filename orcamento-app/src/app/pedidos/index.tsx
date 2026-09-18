import { StyleSheet, Text, View } from 'react-native';

import { AppCard } from '@/components/app-card';
import { AppHeader } from '@/components/app-header';
import { AppScreen } from '@/components/app-screen';
import { StatusBadge } from '@/components/status-badge';
import { AppColors } from '@/constants/app-theme';
import { orders } from '@/mocks/orders';
import { formatCurrency } from '@/utils/format';

export default function OrdersScreen() {
  return <AppScreen header={<AppHeader back title="Pedidos" subtitle="Acompanhamento de compras" />}><View style={styles.page}>{orders.map((order) => <AppCard key={order.id}><View style={styles.top}><View><Text style={styles.number}>Pedido #{order.number}</Text><Text style={styles.client}>{order.clientName}</Text></View><StatusBadge status={order.status} /></View><View style={styles.bottom}><Text style={styles.total}>{formatCurrency(order.total)}</Text><Text style={styles.date}>{order.createdAt}</Text></View></AppCard>)}</View></AppScreen>;
}

const styles = StyleSheet.create({ page: { gap: 12 }, top: { flexDirection: 'row', justifyContent: 'space-between' }, number: { color: AppColors.primaryDark, fontSize: 14, fontWeight: '800' }, client: { color: AppColors.muted, fontSize: 12, marginTop: 4 }, bottom: { alignItems: 'center', borderTopColor: AppColors.line, borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-between', marginTop: 13, paddingTop: 11 }, total: { color: AppColors.ink, fontSize: 15, fontWeight: '800' }, date: { color: AppColors.muted, fontSize: 12 } });
