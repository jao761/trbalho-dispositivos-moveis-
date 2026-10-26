import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppColors } from '@/constants/app-theme';

export function SectionTitle({ title, action }: { title: string; action?: ReactNode }) {
  return <View style={styles.row}><Text style={styles.title}>{title}</Text>{action}</View>;
}

const styles = StyleSheet.create({
  row: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  title: { color: AppColors.ink, fontSize: 17, fontWeight: '800' },
});
