import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { AppColors, AppRadius } from '@/constants/app-theme';

type AppButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  style?: StyleProp<ViewStyle>;
};

export function AppButton({ label, onPress, variant = 'primary', style }: AppButtonProps) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.base, styles[variant], pressed && styles.pressed, style]}>
      <Text style={[styles.label, variant === 'secondary' && styles.secondaryLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', borderRadius: AppRadius.pill, justifyContent: 'center', minHeight: 48, paddingHorizontal: 20 },
  primary: { backgroundColor: AppColors.primary },
  secondary: { backgroundColor: AppColors.infoSoft, borderColor: '#BED7EA', borderWidth: 1 },
  danger: { backgroundColor: AppColors.danger },
  pressed: { opacity: 0.86, transform: [{ scale: 0.98 }] },
  label: { color: AppColors.surface, fontSize: 14, fontWeight: '800' },
  secondaryLabel: { color: AppColors.primaryDark },
});
