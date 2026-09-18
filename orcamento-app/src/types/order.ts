export type OrderStatus = 'AGUARDANDO PAGAMENTO' | 'PAGO' | 'PROCESSANDO' | 'ENVIADO' | 'ENTREGUE' | 'CANCELADO';

export interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  number: string;
  clientName: string;
  total: number;
  createdAt: string;
  status: OrderStatus;
}
