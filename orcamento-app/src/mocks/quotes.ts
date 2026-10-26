import type { Quote } from '@/types/quote';

export const quotes: Quote[] = [
  { id: 'quote-001', number: '000123', clientId: 'client-001', clientName: 'João da Silva', status: 'APROVADO', createdAt: '28/08/2026', validUntil: '07/09/2026', discount: 10, notes: 'Entrega combinada para o período da manhã.', items: [{ id: 'item-001', productId: 'product-001', productName: 'Martelo Tramontina', quantity: 2, unitPrice: 39.9 }, { id: 'item-002', productId: 'product-002', productName: 'Prego galvanizado 18 x 27', quantity: 5, unitPrice: 10 }] },
  { id: 'quote-002', number: '000124', clientId: 'client-002', clientName: 'Construtora Horizonte', status: 'ENVIADO', createdAt: '30/08/2026', validUntil: '09/09/2026', discount: 0, notes: 'Valores válidos enquanto houver estoque.', items: [{ id: 'item-003', productId: 'product-003', productName: 'Serrote profissional', quantity: 6, unitPrice: 80 }] },
  { id: 'quote-003', number: '000125', clientId: 'client-003', clientName: 'Marina Oliveira', status: 'RASCUNHO', createdAt: '01/09/2026', validUntil: '11/09/2026', discount: 0, notes: '', items: [{ id: 'item-004', productId: 'product-004', productName: 'Trena 5 metros', quantity: 2, unitPrice: 29.9 }] },
  { id: 'quote-004', number: '000121', clientId: 'client-004', clientName: 'Oficina Mecânica Norte', status: 'RECUSADO', createdAt: '25/08/2026', validUntil: '04/09/2026', discount: 20, notes: 'Orçamento recusado pelo cliente.', items: [{ id: 'item-005', productId: 'product-001', productName: 'Martelo Tramontina', quantity: 4, unitPrice: 39.9 }] },
];
