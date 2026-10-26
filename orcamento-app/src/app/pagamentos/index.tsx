import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AppCard } from '@/components/app-card';
import { AppHeader } from '@/components/app-header';
import { AppScreen } from '@/components/app-screen';
import { StatusBadge } from '@/components/status-badge';
import { AppColors } from '@/constants/app-theme';
import { listPayments } from '@/services/payments';
import type { Payment } from '@/types/payment';
import { formatCurrency } from '@/utils/format';

export default function PaymentsScreen() {
  const [paymentsList, setPaymentsList] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const data = await listPayments();
      setPaymentsList(data);
    } catch (err) {
      console.warn('Erro ao carregar pagamentos da Payment API:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // The initial request synchronizes the list with the API.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPayments();
  }, []);

  return (
    <AppScreen
      header={
        <AppHeader
          back
          title="Pagamentos"
          subtitle={`${paymentsList.length} transações registradas`}
        />
      }>
      <View style={styles.page}>
        {loading && paymentsList.length === 0 ? (
          <ActivityIndicator color={AppColors.primary} size="large" style={{ marginVertical: 20 }} />
        ) : null}

        {paymentsList.map((payment) => (
          <AppCard key={payment.id}>
            <View style={styles.top}>
              <View>
                <Text style={styles.order}>Pedido #{payment.orderNumber}</Text>
                <Text style={styles.method}>{payment.method || 'Pix'}</Text>
              </View>
              <StatusBadge status={payment.status} />
            </View>
            <View style={styles.bottom}>
              <Text style={styles.amount}>{formatCurrency(payment.amount)}</Text>
              <Text style={styles.date}>{payment.createdAt}</Text>
            </View>
          </AppCard>
        ))}

        {!loading && paymentsList.length === 0 ? (
          <Text style={styles.empty}>Nenhum pagamento registrado.</Text>
        ) : null}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  page: { gap: 12 },
  top: { flexDirection: 'row', justifyContent: 'space-between' },
  order: { color: AppColors.primaryDark, fontSize: 14, fontWeight: '800' },
  method: { color: AppColors.muted, fontSize: 12, marginTop: 4 },
  bottom: { alignItems: 'center', borderTopColor: AppColors.line, borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-between', marginTop: 13, paddingTop: 11 },
  amount: { color: AppColors.ink, fontSize: 15, fontWeight: '800' },
  date: { color: AppColors.muted, fontSize: 12 },
  empty: { color: AppColors.muted, fontSize: 13, textAlign: 'center', marginVertical: 20 },
});
