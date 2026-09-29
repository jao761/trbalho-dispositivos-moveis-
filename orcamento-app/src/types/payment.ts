export type PaymentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REFUNDED' | 'CANCELLED' | 'PENDENTE' | 'APROVADO' | 'RECUSADO' | 'ESTORNADO';

export interface Payment {
  id: string;
  orderNumber: string;
  amount: number;
  method: string;
  status: PaymentStatus;
  createdAt: string;
}
