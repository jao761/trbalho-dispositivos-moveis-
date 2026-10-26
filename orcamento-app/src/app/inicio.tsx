import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AppCard } from '@/components/app-card';
import { AppHeader } from '@/components/app-header';
import { AppScreen } from '@/components/app-screen';
import { SectionTitle } from '@/components/section-title';
import { AppColors, AppRadius } from '@/constants/app-theme';
import { getActiveCompany, getActiveUser, subscribeSession } from '@/services/session';
import { getDashboardData } from '@/services/dashboard';
import type { DashboardData } from '@/types/dashboard';
import { formatCurrency } from '@/utils/format';

const quickActions = [
  { label: 'Novo orçamento', mark: '+', path: '/orcamentos/novo' },
  { label: 'Clientes', mark: 'C', path: '/clientes' },
  { label: 'Orçamentos', mark: 'O', path: '/orcamentos' },
  { label: 'Pedidos', mark: 'P', path: '/pedidos' },
] as const;

export default function DashboardScreen() {
  const router = useRouter();
  const [user, setUser] = useState(getActiveUser());
  const [company, setCompany] = useState(getActiveCompany());
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getDashboardData();
      setData(res);
      setErrorMessage('');
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Não foi possível carregar os indicadores.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeSession(() => {
      setUser(getActiveUser());
      setCompany(getActiveCompany());
      loadData();
    });
    return unsubscribe;
  }, []);

  if (!user || !company) {
    return <AppScreen header={<AppHeader title="Sessão" />}><View style={styles.sessionState}><ActivityIndicator color={AppColors.primary} size="large" /><Text style={styles.sessionText}>Validando sua sessão...</Text></View></AppScreen>;
  }

  if (!data && loading) {
    return <AppScreen activeTab="inicio" header={<AppHeader title={`Olá, ${user.name.split(' ')[0]}`} subtitle={company.name} />}><View style={styles.sessionState}><ActivityIndicator color={AppColors.primary} size="large" /><Text style={styles.sessionText}>Carregando indicadores...</Text></View></AppScreen>;
  }

  if (!data) {
    return <AppScreen activeTab="inicio" header={<AppHeader title={`Olá, ${user.name.split(' ')[0]}`} subtitle={company.name} />}><View style={styles.sessionState}><Text style={styles.sessionText}>{errorMessage || 'Não foi possível carregar os indicadores.'}</Text><Pressable onPress={loadData} style={styles.retry}><Text style={styles.retryText}>Tentar novamente</Text></Pressable></View></AppScreen>;
  }

  const highestSale = Math.max(...data.salesByMonth.map((item) => item.value), 1);

  return (
    <AppScreen
      activeTab="inicio"
      header={
        <AppHeader
          title={`Olá, ${user.name.split(' ')[0]}`}
          subtitle={company.name}
          action={
            <View style={styles.headerActions}>
              <Pressable
                onPress={() => router.push('/historico' as never)}
                style={styles.notification}>
                <Text style={styles.notificationLabel}>H</Text>
              </Pressable>
              <Pressable
                onPress={() => router.push('/perfil' as never)}
                style={styles.avatar}>
                <Text style={styles.avatarLabel}>{user.initials}</Text>
              </Pressable>
            </View>
          }
        />
      }>
      <View style={styles.page}>
        <View style={styles.hero}>
          <Text style={styles.heroEyebrow}>VISÃO GERAL</Text>
          <Text style={styles.heroTitle}>Tudo sob controle.</Text>
          <Text style={styles.heroCopy}>Acompanhe vendas, orçamentos e clientes da sua empresa em tempo real.</Text>
        </View>

        <SectionTitle title="Ações rápidas" />
        <View style={styles.quickGrid}>
          {quickActions.map((action) => (
            <Pressable
              key={action.label}
              onPress={() => router.push(action.path as never)}
              style={({ pressed }) => [styles.quickAction, pressed && styles.pressed]}>
              <View style={styles.quickMark}>
                <Text style={styles.quickMarkText}>{action.mark}</Text>
              </View>
              <Text style={styles.quickLabel}>{action.label}</Text>
            </Pressable>
          ))}
        </View>

        <SectionTitle title="Indicadores" />
        <View style={styles.metrics}>
          <MetricCard label="Vendas" value={formatCurrency(data.salesTotal)} emphasis />
          <MetricCard label="Orçamentos" value={String(data.quoteCount)} />
          <MetricCard label="Aprovados" value={String(data.approvedCount)} />
          <MetricCard label="Pendentes" value={String(data.pendingCount)} />
        </View>

        <SectionTitle title="Status dos orçamentos" />
        <AppCard style={styles.statusCard}>
          <StatusLine color={AppColors.success} label="Aprovados" value={data.approvedCount} />
          <StatusLine color={AppColors.warning} label="Pendentes" value={data.pendingCount} />
          <StatusLine color={AppColors.danger} label="Recusados" value={data.rejectedCount} last />
        </AppCard>

        <SectionTitle title="Vendas por mês" />
        <AppCard>
          <View style={styles.chartHeading}>
            <View>
              <Text style={styles.chartValue}>{formatCurrency(data.salesTotal)}</Text>
              <Text style={styles.chartCaption}>Acumulado no período</Text>
            </View>
          <Text style={styles.chartTag}>Últimos meses</Text>
          </View>
          <View style={styles.chart}>
            {data.salesByMonth.map((item) => (
              <View key={item.label} style={styles.barColumn}>
                <View
                  style={[
                    styles.bar,
                    { height: `${Math.max(18, (item.value / highestSale) * 100)}%` },
                  ]}
                />
                <Text style={styles.barLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </AppCard>
      </View>
    </AppScreen>
  );
}

function MetricCard({ label, value, emphasis = false }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <AppCard style={[styles.metric, emphasis && styles.metricEmphasis]}>
      <Text style={[styles.metricLabel, emphasis && styles.metricLabelEmphasis]}>{label}</Text>
      <Text style={[styles.metricValue, emphasis && styles.metricValueEmphasis]} numberOfLines={1}>
        {value}
      </Text>
    </AppCard>
  );
}

function StatusLine({ color, label, value, last = false }: { color: string; label: string; value: number; last?: boolean }) {
  return (
    <View style={[styles.statusLine, !last && styles.statusLineBorder]}>
      <View style={styles.statusName}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        <Text style={styles.statusLabel}>{label}</Text>
      </View>
      <Text style={styles.statusValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { gap: 24 },
  headerActions: { alignItems: 'center', flexDirection: 'row', gap: 9 },
  notification: { alignItems: 'center', backgroundColor: AppColors.primary, borderRadius: 12, height: 26, justifyContent: 'center', width: 26 },
  notificationLabel: { color: AppColors.surface, fontSize: 11, fontWeight: '800' },
  avatar: { alignItems: 'center', backgroundColor: AppColors.primaryDark, borderRadius: 18, height: 36, justifyContent: 'center', width: 36 },
  avatarLabel: { color: AppColors.surface, fontSize: 11, fontWeight: '800' },
  hero: { backgroundColor: AppColors.primaryDark, borderRadius: AppRadius.lg, padding: 22 },
  heroEyebrow: { color: '#A9D2F3', fontSize: 10, fontWeight: '800', letterSpacing: 1.1 },
  heroTitle: { color: AppColors.surface, fontSize: 25, fontWeight: '800', letterSpacing: -0.5, marginTop: 7 },
  heroCopy: { color: '#D9EBF8', fontSize: 13, lineHeight: 19, marginTop: 7, maxWidth: 260 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickAction: { alignItems: 'center', backgroundColor: AppColors.surface, borderColor: AppColors.line, borderRadius: AppRadius.md, borderWidth: 1, flexBasis: '47%', flexGrow: 1, flexDirection: 'row', gap: 10, minHeight: 70, paddingHorizontal: 12 },
  quickMark: { alignItems: 'center', backgroundColor: AppColors.infoSoft, borderRadius: 13, height: 34, justifyContent: 'center', width: 34 },
  quickMarkText: { color: AppColors.primary, fontSize: 15, fontWeight: '800' },
  quickLabel: { color: AppColors.ink, flex: 1, fontSize: 12, fontWeight: '800' },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metric: { flexBasis: '46%', flexGrow: 1, minHeight: 92, padding: 14 },
  metricEmphasis: { backgroundColor: AppColors.primary },
  metricLabel: { color: AppColors.muted, fontSize: 12, fontWeight: '700' },
  metricLabelEmphasis: { color: '#D8EDFC' },
  metricValue: { color: AppColors.ink, fontSize: 19, fontWeight: '800', marginTop: 9 },
  metricValueEmphasis: { color: AppColors.surface },
  statusCard: { paddingVertical: 4 },
  statusLine: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', minHeight: 49 },
  statusLineBorder: { borderBottomColor: AppColors.line, borderBottomWidth: 1 },
  statusName: { alignItems: 'center', flexDirection: 'row', gap: 9 },
  dot: { borderRadius: 5, height: 10, width: 10 },
  statusLabel: { color: AppColors.ink, fontSize: 14, fontWeight: '700' },
  statusValue: { color: AppColors.primaryDark, fontSize: 16, fontWeight: '800' },
  chartHeading: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between' },
  chartValue: { color: AppColors.ink, fontSize: 19, fontWeight: '800' },
  chartCaption: { color: AppColors.muted, fontSize: 11, marginTop: 3 },
  chartTag: { backgroundColor: AppColors.infoSoft, borderRadius: AppRadius.pill, color: AppColors.primaryDark, fontSize: 11, fontWeight: '800', paddingHorizontal: 9, paddingVertical: 4 },
  chart: { alignItems: 'flex-end', flexDirection: 'row', height: 138, justifyContent: 'space-between', marginTop: 18, paddingBottom: 6 },
  barColumn: { alignItems: 'center', flex: 1, height: '100%', justifyContent: 'flex-end' },
  bar: { backgroundColor: AppColors.primary, borderRadius: 6, minHeight: 18, width: 22 },
  barLabel: { color: AppColors.muted, fontSize: 11, fontWeight: '700', marginTop: 8 },
  pressed: { opacity: 0.7 },
  sessionState: { alignItems: 'center', flex: 1, gap: 12, justifyContent: 'center' },
  sessionText: { color: AppColors.muted, fontSize: 14 },
  retry: { backgroundColor: AppColors.primary, borderRadius: AppRadius.pill, paddingHorizontal: 16, paddingVertical: 10 },
  retryText: { color: AppColors.surface, fontSize: 13, fontWeight: '800' },
});
