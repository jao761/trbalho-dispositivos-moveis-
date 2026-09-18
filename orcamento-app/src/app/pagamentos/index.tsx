import { StyleSheet, Text, View } from 'react-native';

import { AppCard } from '@/components/app-card';
import { AppHeader } from '@/components/app-header';
import { AppScreen } from '@/components/app-screen';
import { StatusBadge } from '@/components/status-badge';
import { AppColors } from '@/constants/app-theme';
import { payments } from '@/mocks/payments';
import { formatCurrency } from '@/utils/format';

export default function PaymentsScreen() {
  return <AppScreen header={<AppHeader back title="Pagamentos" subtitle="Preparado para integração futura" />}><View style={styles.page}>{payments.map((payment) => <AppCard key={payment.id}><View style={styles.top}><View><Text style={styles.order}>Pedido #{payment.orderNumber}</Text><Text style={styles.method}>{payment.method}</Text></View><StatusBadge status={payment.status} /></View><View style={styles.bottom}><Text style={styles.amount}>{formatCurrency(payment.amount)}</Text><Text style={styles.date}>{payment.createdAt}</Text></View></AppCard>)}</View></AppScreen>;
}

const styles = StyleSheet.create({ page: { gap: 12 }, top: { flexDirection: 'row', justifyContent: 'space-between' }, order: { color: AppColors.primaryDark, fontSize: 14, fontWeight: '800' }, method: { color: AppColors.muted, fontSize: 12, marginTop: 4 }, bottom: { alignItems: 'center', borderTopColor: AppColors.line, borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-between', marginTop: 13, paddingTop: 11 }, amount: { color: AppColors.ink, fontSize: 15, fontWeight: '800' }, date: { color: AppColors.muted, fontSize: 12 } });
