import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AppCard } from '@/components/app-card';
import { AppHeader } from '@/components/app-header';
import { AppScreen } from '@/components/app-screen';
import { StatusBadge } from '@/components/status-badge';
import { AppColors } from '@/constants/app-theme';
import { listOrders } from '@/services/orders';
import type { Order } from '@/types/order';
import { formatCurrency } from '@/utils/format';

export default function OrdersScreen() {
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await listOrders();
      setOrdersList(data);
    } catch (err) {
      console.warn('Erro ao carregar pedidos da Order API:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // The initial request synchronizes the list with the API.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrders();
  }, []);

  return (
    <AppScreen header={<AppHeader back title="Pedidos" subtitle={`${ordersList.length} compras registradas`} />}>
      <View style={styles.page}>
        {loading && ordersList.length === 0 ? (
          <ActivityIndicator color={AppColors.primary} size="large" style={{ marginVertical: 20 }} />
        ) : null}

        {ordersList.map((order) => (
          <AppCard key={order.id}>
            <View style={styles.top}>
              <View>
                <Text style={styles.number}>Pedido #{order.number}</Text>
                <Text style={styles.client}>{order.clientName}</Text>
              </View>
              <StatusBadge status={order.status} />
            </View>
            <View style={styles.bottom}>
              <Text style={styles.total}>{formatCurrency(order.total)}</Text>
              <Text style={styles.date}>{order.createdAt}</Text>
            </View>
          </AppCard>
        ))}

        {!loading && ordersList.length === 0 ? (
          <Text style={styles.empty}>Nenhum pedido encontrado.</Text>
        ) : null}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  page: { gap: 12 },
  top: { flexDirection: 'row', justifyContent: 'space-between' },
  number: { color: AppColors.primaryDark, fontSize: 14, fontWeight: '800' },
  client: { color: AppColors.muted, fontSize: 12, marginTop: 4 },
  bottom: { alignItems: 'center', borderTopColor: AppColors.line, borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-between', marginTop: 13, paddingTop: 11 },
  total: { color: AppColors.ink, fontSize: 15, fontWeight: '800' },
  date: { color: AppColors.muted, fontSize: 12 },
  empty: { color: AppColors.muted, fontSize: 13, textAlign: 'center', marginVertical: 20 },
});
