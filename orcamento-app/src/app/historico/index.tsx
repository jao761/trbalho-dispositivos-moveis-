import { StyleSheet, Text, View } from 'react-native';

import { AppCard } from '@/components/app-card';
import { AppHeader } from '@/components/app-header';
import { AppScreen } from '@/components/app-screen';
import { AppColors } from '@/constants/app-theme';
import { activityItems } from '@/mocks/activity';

const toneColors = { primary: AppColors.primary, success: AppColors.success, warning: AppColors.warning } as const;

export default function HistoryScreen() {
  return <AppScreen header={<AppHeader back title="Histórico" subtitle="Atividades recentes da empresa" />}><View style={styles.page}>{activityItems.map((activity) => <View key={activity.id} style={styles.row}><View style={styles.rail}><View style={[styles.dot, { backgroundColor: toneColors[activity.tone] }]} /><View style={styles.line} /></View><AppCard style={styles.card}><Text style={styles.date}>{activity.date}</Text><Text style={styles.title}>{activity.title}</Text><Text style={styles.detail}>{activity.detail}</Text></AppCard></View>)}</View></AppScreen>;
}

const styles = StyleSheet.create({ page: { paddingLeft: 4 }, row: { flexDirection: 'row', minHeight: 104 }, rail: { alignItems: 'center', width: 25 }, dot: { borderColor: AppColors.surface, borderRadius: 8, borderWidth: 3, height: 16, width: 16, zIndex: 1 }, line: { backgroundColor: AppColors.line, flex: 1, width: 2 }, card: { flex: 1, marginBottom: 14 }, date: { color: AppColors.primary, fontSize: 10, fontWeight: '800' }, title: { color: AppColors.ink, fontSize: 14, fontWeight: '800', marginTop: 6 }, detail: { color: AppColors.muted, fontSize: 12, lineHeight: 17, marginTop: 5 } });
