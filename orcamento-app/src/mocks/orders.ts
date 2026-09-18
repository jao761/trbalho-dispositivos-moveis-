import type { Order } from '@/types/order';

export const orders: Order[] = [
  { id: 'order-001', number: '00057', clientName: 'João da Silva', total: 119.8, createdAt: '29/08/2026', status: 'PAGO' },
  { id: 'order-002', number: '00058', clientName: 'Construtora Horizonte', total: 4680, createdAt: '30/08/2026', status: 'PROCESSANDO' },
  { id: 'order-003', number: '00059', clientName: 'Oficina Mecânica Norte', total: 2140, createdAt: '02/09/2026', status: 'AGUARDANDO PAGAMENTO' },
];
