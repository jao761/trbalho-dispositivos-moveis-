import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AppColors } from '@/constants/app-theme';

type AppHeaderProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  back?: boolean;
};

export function AppHeader({ title, subtitle, action, back = false }: AppHeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.header}>
      {back ? (
        <Pressable accessibilityLabel="Voltar" accessibilityRole="button" onPress={() => router.back()} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
          <Text style={styles.backLabel}>‹</Text>
        </Pressable>
      ) : null}
      <View style={styles.copy}>
        <Text accessibilityRole="header" style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', flexDirection: 'row', minHeight: 58, paddingHorizontal: 20, paddingVertical: 10 },
  backButton: { alignItems: 'center', backgroundColor: AppColors.infoSoft, borderRadius: 18, height: 36, justifyContent: 'center', marginRight: 11, width: 36 },
  backLabel: { color: AppColors.primaryDark, fontSize: 30, fontWeight: '400', lineHeight: 31, marginTop: -3 },
  copy: { flex: 1 },
  title: { color: AppColors.ink, fontSize: 21, fontWeight: '800', letterSpacing: -0.35 },
  subtitle: { color: AppColors.muted, fontSize: 12, marginTop: 2 },
  action: { marginLeft: 12 },
  pressed: { opacity: 0.7 },
});
