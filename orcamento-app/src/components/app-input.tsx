import { StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';

import { AppColors, AppRadius } from '@/constants/app-theme';

type AppInputProps = TextInputProps & { label: string };

export function AppInput({ label, style, ...props }: AppInputProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput accessibilityLabel={label} placeholderTextColor={AppColors.placeholder} selectionColor={AppColors.primary} style={[styles.input, style]} {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: 14 },
  label: { color: AppColors.ink, fontSize: 13, fontWeight: '700', marginBottom: 7 },
  input: { backgroundColor: AppColors.surface, borderColor: AppColors.inputBorder, borderRadius: AppRadius.sm, borderWidth: 1, color: AppColors.ink, fontSize: 15, minHeight: 48, paddingHorizontal: 14, paddingVertical: 10 },
});
