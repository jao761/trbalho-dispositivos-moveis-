import type { OrderStatus } from '@/types/order';
import type { PaymentStatus } from '@/types/payment';
import type { QuoteStatus } from '@/types/quote';

const quoteLabels: Record<QuoteStatus, string> = {
  DRAFT: 'Rascunho', SENT: 'Enviado', APPROVED: 'Aprovado', REJECTED: 'Recusado', EXPIRED: 'Expirado',
  RASCUNHO: 'Rascunho', ENVIADO: 'Enviado', APROVADO: 'Aprovado', RECUSADO: 'Recusado', EXPIRADO: 'Expirado',
};

const orderLabels: Record<OrderStatus, string> = {
  PENDING: 'Pendente', PAYMENT_PENDING: 'Aguardando pagamento', PAID: 'Pago', PROCESSING: 'Processando', SHIPPED: 'Enviado', DELIVERED: 'Entregue', CANCELLED: 'Cancelado',
  'AGUARDANDO PAGAMENTO': 'Aguardando pagamento', PAGO: 'Pago', PROCESSANDO: 'Processando', ENVIADO: 'Enviado', ENTREGUE: 'Entregue', CANCELADO: 'Cancelado',
};

const paymentLabels: Record<PaymentStatus, string> = {
  PENDING: 'Pendente', APPROVED: 'Aprovado', REJECTED: 'Recusado', REFUNDED: 'Estornado', CANCELLED: 'Cancelado',
  PENDENTE: 'Pendente', APROVADO: 'Aprovado', RECUSADO: 'Recusado', ESTORNADO: 'Estornado',
};

export function getStatusLabel(status: string) {
  return quoteLabels[status as QuoteStatus] ?? orderLabels[status as OrderStatus] ?? paymentLabels[status as PaymentStatus] ?? status;
}
