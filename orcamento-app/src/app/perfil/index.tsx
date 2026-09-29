import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Link, useRouter } from 'expo-router';

import { AppButton } from '@/components/app-button';
import { AppCard } from '@/components/app-card';
import { AppHeader } from '@/components/app-header';
import { AppScreen } from '@/components/app-screen';
import { AppColors } from '@/constants/app-theme';
import { logout } from '@/services/auth';
import { getActiveCompany, getActiveUser } from '@/services/session';

const settings = [
  { label: 'Minha conta', detail: 'Dados pessoais e acesso', path: undefined },
  { label: 'Preferências', detail: 'Aparência e formato de valores', path: undefined },
  { label: 'Notificações', detail: 'Alertas do aplicativo', path: undefined },
  { label: 'Segurança', detail: 'Senha e permissões', path: undefined },
  { label: 'Histórico', detail: 'Atividades da empresa', path: '/historico' },
  { label: 'Pedidos', detail: 'Acompanhe as vendas', path: '/pedidos' },
  { label: 'Pagamentos', detail: 'Status e integrações futuras', path: '/pagamentos' },
] as const;

export default function ProfileScreen() {
  const router = useRouter();
  const user = getActiveUser();
  const company = getActiveCompany();
  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };
  if (!user || !company) return null;
  const profileSettings = [{ label: 'Empresa', detail: company.name, path: undefined }, ...settings];
  return <AppScreen activeTab="perfil" header={<AppHeader title="Perfil" subtitle="Configurações da conta" />}><View style={styles.page}><AppCard style={styles.profile}><View style={styles.avatar}><Text style={styles.avatarText}>{user.initials}</Text></View><View><Text style={styles.name}>{user.name}</Text><Text style={styles.email}>{user.email}</Text><Text style={styles.company}>{company.name}</Text></View></AppCard>{profileSettings.map((setting) => setting.path ? <Link href={setting.path as never} asChild key={setting.label}><Pressable style={({ pressed }) => pressed && styles.pressed}><SettingCard detail={setting.detail} label={setting.label} /></Pressable></Link> : <SettingCard detail={setting.detail} key={setting.label} label={setting.label} />)}<AppButton label="Sair" onPress={handleLogout} style={styles.logout} variant="danger" /></View></AppScreen>;
}

function SettingCard({ label, detail }: { label: string; detail: string }) { return <AppCard style={styles.setting}><View><Text style={styles.settingLabel}>{label}</Text><Text style={styles.settingDetail}>{detail}</Text></View><Text style={styles.arrow}>›</Text></AppCard>; }

const styles = StyleSheet.create({ page: { gap: 11 }, profile: { alignItems: 'center', flexDirection: 'row', gap: 13 }, avatar: { alignItems: 'center', backgroundColor: AppColors.primaryDark, borderRadius: 28, height: 56, justifyContent: 'center', width: 56 }, avatarText: { color: AppColors.surface, fontSize: 16, fontWeight: '800' }, name: { color: AppColors.ink, fontSize: 16, fontWeight: '800' }, email: { color: AppColors.muted, fontSize: 12, marginTop: 4 }, company: { color: AppColors.primary, fontSize: 12, fontWeight: '700', marginTop: 4 }, setting: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }, settingLabel: { color: AppColors.ink, fontSize: 14, fontWeight: '800' }, settingDetail: { color: AppColors.muted, fontSize: 11, marginTop: 4 }, arrow: { color: AppColors.primary, fontSize: 25 }, logout: { marginTop: 10 }, pressed: { opacity: 0.72 } });
