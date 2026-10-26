import type { PropsWithChildren } from 'react';
import { StyleSheet, type StyleProp, View, type ViewStyle } from 'react-native';

import { AppColors, AppRadius } from '@/constants/app-theme';

type AppCardProps = PropsWithChildren<{ style?: StyleProp<ViewStyle> }>;

export function AppCard({ children, style }: AppCardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: AppColors.surface,
    borderColor: AppColors.line,
    borderRadius: AppRadius.md,
    borderWidth: 1,
    padding: 16,
    shadowColor: AppColors.primaryDark,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
});
