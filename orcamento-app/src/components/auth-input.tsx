import { StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';

import { AuthColors } from '@/constants/auth-theme';

type AuthInputProps = TextInputProps & {
  label: string;
};

export function AuthInput({ label, style, ...inputProps }: AuthInputProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={AuthColors.placeholder}
        selectionColor={AuthColors.primary}
        style={[styles.input, style]}
        {...inputProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: 16,
  },
  label: {
    color: AuthColors.ink,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 7,
  },
  input: {
    backgroundColor: AuthColors.input,
    borderColor: AuthColors.inputBorder,
    borderRadius: 14,
    borderWidth: 1,
    color: AuthColors.ink,
    fontSize: 15,
    height: 52,
    paddingHorizontal: 15,
  },
});
