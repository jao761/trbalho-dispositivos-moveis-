import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AppCard } from '@/components/app-card';
import { AppHeader } from '@/components/app-header';
import { AppScreen } from '@/components/app-screen';
import { SectionTitle } from '@/components/section-title';
import { AppColors, AppRadius } from '@/constants/app-theme';
import { dashboardData } from '@/mocks/dashboard';
import { currentCompany, currentUser } from '@/mocks/account';
import { formatCurrency } from '@/utils/format';

const quickActions = [
  { label: 'Novo orçamento', mark: '+', path: '/orcamentos/novo' },
  { label: 'Clientes', mark: 'C', path: '/clientes' },
  { label: 'Orçamentos', mark: 'O', path: '/orcamentos' },
  { label: 'Produtos', mark: 'P', path: '/produtos' },
] as const;

export default function DashboardScreen() {
  const router = useRouter();
  const highestSale = Math.max(...dashboardData.salesByMonth.map((item) => item.value));

  return (
    <AppScreen
      activeTab="inicio"
      header={<AppHeader title={`Olá, ${currentUser.name.split(' ')[0]}`} subtitle={currentCompany.name} action={<View style={styles.headerActions}><View style={styles.notification}><Text style={styles.notificationLabel}>3</Text></View><View style={styles.avatar}><Text style={styles.avatarLabel}>{currentUser.initials}</Text></View></View>} />}>
      <View style={styles.page}>
        <View style={styles.hero}><Text style={styles.heroEyebrow}>VISÃO GERAL</Text><Text style={styles.heroTitle}>Tudo sob controle.</Text><Text style={styles.heroCopy}>Acompanhe vendas, orçamentos e clientes da sua empresa.</Text></View>

        <SectionTitle title="Ações rápidas" />
        <View style={styles.quickGrid}>
          {quickActions.map((action) => <Pressable key={action.label} onPress={() => router.push(action.path as never)} style={({ pressed }) => [styles.quickAction, pressed && styles.pressed]}><View style={styles.quickMark}><Text style={styles.quickMarkText}>{action.mark}</Text></View><Text style={styles.quickLabel}>{action.label}</Text></Pressable>)}
        </View>

        <SectionTitle title="Indicadores" />
        <View style={styles.metrics}>
          <MetricCard label="Vendas" value={formatCurrency(dashboardData.salesTotal)} emphasis />
          <MetricCard label="Orçamentos" value={String(dashboardData.quoteCount)} />
          <MetricCard label="Aprovados" value={String(dashboardData.approvedCount)} />
          <MetricCard label="Pendentes" value={String(dashboardData.pendingCount)} />
        </View>

        <SectionTitle title="Status dos orçamentos" />
        <AppCard style={styles.statusCard}>
          <StatusLine color={AppColors.success} label="Aprovados" value={dashboardData.approvedCount} />
          <StatusLine color={AppColors.warning} label="Pendentes" value={dashboardData.pendingCount} />
          <StatusLine color={AppColors.danger} label="Recusados" value={dashboardData.rejectedCount} last />
        </AppCard>

        <SectionTitle title="Vendas por mês" />
        <AppCard>
          <View style={styles.chartHeading}><View><Text style={styles.chartValue}>{formatCurrency(dashboardData.salesTotal)}</Text><Text style={styles.chartCaption}>Acumulado no período</Text></View><Text style={styles.chartTag}>2026</Text></View>
          <View style={styles.chart}>{dashboardData.salesByMonth.map((item) => <View key={item.label} style={styles.barColumn}><View style={[styles.bar, { height: `${Math.max(18, (item.value / highestSale) * 100)}%` }]} /><Text style={styles.barLabel}>{item.label}</Text></View>)}</View>
        </AppCard>
      </View>
    </AppScreen>
  );
}

function MetricCard({ label, value, emphasis = false }: { label: string; value: string; emphasis?: boolean }) {
  return <AppCard style={[styles.metric, emphasis && styles.metricEmphasis]}><Text style={[styles.metricLabel, emphasis && styles.metricLabelEmphasis]}>{label}</Text><Text style={[styles.metricValue, emphasis && styles.metricValueEmphasis]} numberOfLines={1}>{value}</Text></AppCard>;
}

function StatusLine({ color, label, value, last = false }: { color: string; label: string; value: number; last?: boolean }) {
  return <View style={[styles.statusLine, !last && styles.statusLineBorder]}><View style={styles.statusName}><View style={[styles.dot, { backgroundColor: color }]} /><Text style={styles.statusLabel}>{label}</Text></View><Text style={styles.statusValue}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  page: { gap: 24 },
  headerActions: { alignItems: 'center', flexDirection: 'row', gap: 9 },
  notification: { alignItems: 'center', backgroundColor: AppColors.danger, borderRadius: 12, height: 24, justifyContent: 'center', width: 24 },
  notificationLabel: { color: AppColors.surface, fontSize: 10, fontWeight: '800' },
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
  chartTag: { color: AppColors.primary, fontSize: 11, fontWeight: '800' },
  chart: { alignItems: 'flex-end', borderBottomColor: AppColors.line, borderBottomWidth: 1, flexDirection: 'row', height: 150, justifyContent: 'space-between', marginTop: 18, paddingHorizontal: 2 },
  barColumn: { alignItems: 'center', flex: 1, gap: 7, height: '100%', justifyContent: 'flex-end' },
  bar: { backgroundColor: AppColors.primaryLight, borderRadius: 7, maxWidth: 22, width: '58%' },
  barLabel: { color: AppColors.muted, fontSize: 10 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
});
