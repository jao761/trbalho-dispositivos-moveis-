export interface ActivityItem {
  id: string;
  date: string;
  title: string;
  detail: string;
  tone: 'primary' | 'success' | 'warning';
}

export const activityItems: ActivityItem[] = [
  { id: 'activity-001', date: '28/08/2026', title: 'Orçamento #000123 criado', detail: 'João da Silva · R$ 119,80', tone: 'primary' },
  { id: 'activity-002', date: '28/08/2026', title: 'Orçamento #000123 aprovado', detail: 'Cliente confirmou a proposta.', tone: 'success' },
  { id: 'activity-003', date: '29/08/2026', title: 'Pedido #00057 criado', detail: 'Aguardando separação dos itens.', tone: 'warning' },
  { id: 'activity-004', date: '29/08/2026', title: 'Pagamento aprovado', detail: 'Pedido #00057 · Pix', tone: 'success' },
];
