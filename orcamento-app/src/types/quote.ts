export type QuoteStatus =
  | 'DRAFT'
  | 'SENT'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'RASCUNHO'
  | 'ENVIADO'
  | 'APROVADO'
  | 'RECUSADO'
  | 'EXPIRADO';

export interface QuoteItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface Quote {
  id: string;
  number: string;
  clientId: string;
  clientName: string;
  status: QuoteStatus;
  createdAt: string;
  validUntil: string;
  discount: number;
  subtotal?: number;
  total?: number;
  notes: string;
  items: QuoteItem[];
}
