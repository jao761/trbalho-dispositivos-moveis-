import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AppColors } from '@/constants/app-theme';

export type MainTab = 'inicio' | 'clientes' | 'orcamentos' | 'produtos' | 'perfil';

const tabs: Array<{ key: MainTab; label: string; path: '/inicio' | '/clientes' | '/orcamentos' | '/produtos' | '/perfil'; mark: string }> = [
  { key: 'inicio', label: 'Início', path: '/inicio', mark: '●' },
  { key: 'clientes', label: 'Clientes', path: '/clientes', mark: 'C' },
  { key: 'orcamentos', label: 'Orçamentos', path: '/orcamentos', mark: 'O' },
  { key: 'produtos', label: 'Produtos', path: '/produtos', mark: 'P' },
  { key: 'perfil', label: 'Perfil', path: '/perfil', mark: '◉' },
];

export function BottomTabBar({ active }: { active: MainTab }) {
  const router = useRouter();
  return (
    <View style={styles.bar}>
      {tabs.map((tab) => {
        const selected = tab.key === active;
        return <Pressable accessibilityLabel={tab.label} accessibilityRole="tab" accessibilityState={{ selected }} key={tab.key} onPress={() => router.replace(tab.path as never)} style={({ pressed }) => [styles.item, pressed && styles.pressed]}><Text style={[styles.mark, selected && styles.markActive]}>{tab.mark}</Text><Text style={[styles.label, selected && styles.labelActive]}>{tab.label}</Text></Pressable>;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { backgroundColor: AppColors.surface, borderTopColor: AppColors.line, borderTopWidth: 1, flexDirection: 'row', minHeight: 66, paddingHorizontal: 4, paddingTop: 8 },
  item: { alignItems: 'center', flex: 1, gap: 2 },
  mark: { color: AppColors.mutedLight, fontSize: 14, fontWeight: '800', height: 18 },
  markActive: { color: AppColors.primary },
  label: { color: AppColors.mutedLight, fontSize: 10, fontWeight: '700' },
  labelActive: { color: AppColors.primaryDark },
  pressed: { opacity: 0.65 },
});
