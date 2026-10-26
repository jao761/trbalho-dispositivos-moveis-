import { Pressable, StyleSheet, Text } from 'react-native';

import { AuthColors } from '@/constants/auth-theme';

type AuthButtonProps = {
  label: string;
  onPress: () => void;
};

export function AuthButton({ label, onPress }: AuthButtonProps) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: AuthColors.primary,
    borderColor: AuthColors.primaryDark,
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: 'center',
    marginTop: 26,
    minHeight: 52,
    paddingHorizontal: 36,
    shadowColor: AuthColors.primaryDark,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.22,
    shadowRadius: 7,
  },
  buttonPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.98 }],
  },
  label: {
    color: AuthColors.surface,
    fontSize: 15,
    fontWeight: '800',
  },
});
