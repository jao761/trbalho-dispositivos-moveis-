export type PaymentStatus = 'PENDENTE' | 'APROVADO' | 'RECUSADO' | 'ESTORNADO';

export interface Payment {
  id: string;
  orderNumber: string;
  amount: number;
  method: string;
  status: PaymentStatus;
  createdAt: string;
}
