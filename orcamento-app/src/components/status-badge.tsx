import { StyleSheet, Text, View } from 'react-native';

import { AppColors, AppRadius } from '@/constants/app-theme';

type StatusBadgeProps = { status: string };

function getTone(status: string) {
  if (['APROVADO', 'PAGO', 'ENTREGUE'].includes(status)) return { backgroundColor: AppColors.successSoft, color: AppColors.success };
  if (['RECUSADO', 'CANCELADO', 'ESTORNADO'].includes(status)) return { backgroundColor: AppColors.dangerSoft, color: AppColors.danger };
  if (['PENDENTE', 'AGUARDANDO PAGAMENTO', 'RASCUNHO', 'EXPIRADO'].includes(status)) return { backgroundColor: AppColors.warningSoft, color: AppColors.warning };
  return { backgroundColor: AppColors.infoSoft, color: AppColors.primary };
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const tone = getTone(status);
  return <View style={[styles.badge, { backgroundColor: tone.backgroundColor }]}><Text style={[styles.label, { color: tone.color }]}>{status}</Text></View>;
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', borderRadius: AppRadius.pill, paddingHorizontal: 9, paddingVertical: 5 },
  label: { fontSize: 10, fontWeight: '800', letterSpacing: 0.35 },
});
