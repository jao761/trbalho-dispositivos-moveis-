export type QuoteStatus = 'RASCUNHO' | 'ENVIADO' | 'APROVADO' | 'RECUSADO' | 'EXPIRADO';

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
  notes: string;
  items: QuoteItem[];
}
