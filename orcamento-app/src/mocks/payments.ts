import type { Payment } from '@/types/payment';

export const payments: Payment[] = [
  { id: 'payment-001', orderNumber: '00057', amount: 119.8, method: 'Pix', status: 'APROVADO', createdAt: '29/08/2026' },
  { id: 'payment-002', orderNumber: '00058', amount: 4680, method: 'Boleto', status: 'PENDENTE', createdAt: '30/08/2026' },
  { id: 'payment-003', orderNumber: '00059', amount: 2140, method: 'Cartão', status: 'RECUSADO', createdAt: '02/09/2026' },
];
