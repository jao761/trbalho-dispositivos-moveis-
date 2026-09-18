import { StyleSheet, Text, TextInput, View } from 'react-native';

import { AppColors, AppRadius } from '@/constants/app-theme';

type SearchBarProps = { value: string; onChangeText: (value: string) => void; placeholder: string };

export function SearchBar({ value, onChangeText, placeholder }: SearchBarProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.icon}>⌕</Text>
      <TextInput accessibilityLabel={placeholder} autoCapitalize="none" clearButtonMode="while-editing" onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={AppColors.placeholder} style={styles.input} value={value} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', backgroundColor: AppColors.surface, borderColor: AppColors.inputBorder, borderRadius: AppRadius.pill, borderWidth: 1, flexDirection: 'row', minHeight: 48, paddingHorizontal: 15 },
  icon: { color: AppColors.primary, fontSize: 23, lineHeight: 25, marginRight: 8 },
  input: { color: AppColors.ink, flex: 1, fontSize: 14, minHeight: 46 },
});
