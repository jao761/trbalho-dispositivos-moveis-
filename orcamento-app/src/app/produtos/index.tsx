import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AppCard } from '@/components/app-card';
import { AppHeader } from '@/components/app-header';
import { AppScreen } from '@/components/app-screen';
import { SearchBar } from '@/components/search-bar';
import { StatusBadge } from '@/components/status-badge';
import { AppColors } from '@/constants/app-theme';
import { listProducts } from '@/services/products';
import type { Product } from '@/types/product';
import { formatCurrency } from '@/utils/format';

export default function ProductsScreen() {
  const [search, setSearch] = useState('');
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let active = true;
    // Product search synchronizes the screen with the catalog API.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    listProducts(search)
      .then((data) => active && setProductsList(data))
      .catch((error: unknown) => active && setErrorMessage(error instanceof Error ? error.message : 'Não foi possível carregar o catálogo.'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [search]);

  return <AppScreen activeTab="produtos" header={<AppHeader title="Produtos" subtitle="Consulta de catálogo" />}><View style={styles.page}><SearchBar onChangeText={setSearch} placeholder="Pesquisar produto" value={search} />{loading ? <ActivityIndicator color={AppColors.primary} /> : null}{errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}{productsList.map((product) => <AppCard key={product.id}><View style={styles.top}><View style={styles.copy}><Text style={styles.name}>{product.name}</Text><Text style={styles.description}>{product.description}</Text></View><Text style={styles.price}>{formatCurrency(product.price)}</Text></View><View style={styles.bottom}><Text style={styles.stock}>Estoque: {product.stock}</Text><StatusBadge status={product.stock > 0 ? 'DISPONÍVEL' : 'INDISPONÍVEL'} /></View></AppCard>)}</View></AppScreen>;
}

const styles = StyleSheet.create({ page: { gap: 12 }, top: { alignItems: 'flex-start', flexDirection: 'row', gap: 10, justifyContent: 'space-between' }, copy: { flex: 1 }, name: { color: AppColors.ink, fontSize: 15, fontWeight: '800' }, description: { color: AppColors.muted, fontSize: 12, lineHeight: 17, marginTop: 5 }, price: { color: AppColors.primaryDark, fontSize: 15, fontWeight: '800' }, bottom: { alignItems: 'center', borderTopColor: AppColors.line, borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-between', marginTop: 13, paddingTop: 11 }, stock: { color: AppColors.muted, fontSize: 12 }, error: { color: AppColors.danger, fontSize: 13, fontWeight: '700' } });
