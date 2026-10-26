import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { AuthColors } from '@/constants/auth-theme';

export function AuthCard({ children }: PropsWithChildren) {
  return (
    <LinearGradient
      colors={[AuthColors.primaryDark, AuthColors.primary, AuthColors.primaryLight]}
      end={{ x: 0.95, y: 1 }}
      start={{ x: 0.1, y: 0 }}
      style={styles.card}>
      <View pointerEvents="none" style={styles.whiteSurface} />
      <View pointerEvents="none" style={styles.highlight} />
      <View style={styles.content}>{children}</View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderColor: AuthColors.primaryDark,
    borderRadius: 30,
    borderWidth: 1.5,
    elevation: 8,
    minHeight: 420,
    overflow: 'hidden',
    shadowColor: AuthColors.primaryDark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
  },
  whiteSurface: {
    backgroundColor: AuthColors.surface,
    borderBottomRightRadius: 270,
    borderTopRightRadius: 180,
    height: '118%',
    left: -96,
    position: 'absolute',
    top: -52,
    width: '132%',
  },
  highlight: {
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: 120,
    height: 240,
    position: 'absolute',
    right: -170,
    top: -108,
    width: 240,
  },
  content: {
    paddingHorizontal: 28,
    paddingVertical: 38,
    width: '82%',
  },
});
