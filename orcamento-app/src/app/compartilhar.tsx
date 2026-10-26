import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppCard } from '@/components/app-card';
import { AppHeader } from '@/components/app-header';
import { AppScreen } from '@/components/app-screen';
import { AppColors } from '@/constants/app-theme';

const options = [
  { title: 'Gerar PDF', description: 'Crie uma versão do documento', mark: 'PDF' },
  { title: 'Compartilhar', description: 'Envie pelo canal que preferir', mark: '↗' },
  { title: 'WhatsApp', description: 'Prepare uma mensagem para o cliente', mark: 'W' },
  { title: 'E-mail', description: 'Monte um e-mail com o orçamento', mark: '@' },
  { title: 'Salvar', description: 'Mantenha uma cópia no dispositivo', mark: '↓' },
  { title: 'Imprimir', description: 'Envie para uma impressora compatível', mark: '▣' },
];

export default function ShareScreen() {
  const [feedback, setFeedback] = useState('');
  return <AppScreen header={<AppHeader back title="Compartilhar orçamento" subtitle="Escolha uma ação" />}><View style={styles.page}><AppCard style={styles.preview}><Text style={styles.previewTitle}>ORÇAMENTO #000123</Text><Text style={styles.previewCopy}>João da Silva · R$ 119,80</Text></AppCard>{options.map((option) => <Pressable key={option.title} onPress={() => setFeedback(`${option.title}: ação preparada para integração futura.`)} style={({ pressed }) => pressed && styles.pressed}><AppCard style={styles.option}><View style={styles.mark}><Text style={styles.markText}>{option.mark}</Text></View><View style={styles.optionCopy}><Text style={styles.optionTitle}>{option.title}</Text><Text style={styles.optionDescription}>{option.description}</Text></View><Text style={styles.arrow}>›</Text></AppCard></Pressable>)}{feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}</View></AppScreen>;
}

const styles = StyleSheet.create({ page: { gap: 11 }, preview: { backgroundColor: AppColors.primaryDark }, previewTitle: { color: AppColors.surface, fontSize: 14, fontWeight: '900', letterSpacing: 0.7 }, previewCopy: { color: '#D8EDFC', fontSize: 12, marginTop: 5 }, option: { alignItems: 'center', flexDirection: 'row', gap: 12 }, mark: { alignItems: 'center', backgroundColor: AppColors.infoSoft, borderRadius: 14, height: 38, justifyContent: 'center', width: 38 }, markText: { color: AppColors.primary, fontSize: 13, fontWeight: '900' }, optionCopy: { flex: 1 }, optionTitle: { color: AppColors.ink, fontSize: 14, fontWeight: '800' }, optionDescription: { color: AppColors.muted, fontSize: 11, marginTop: 4 }, arrow: { color: AppColors.primary, fontSize: 25 }, feedback: { color: AppColors.success, fontSize: 12, lineHeight: 18, textAlign: 'center' }, pressed: { opacity: 0.7 } });
