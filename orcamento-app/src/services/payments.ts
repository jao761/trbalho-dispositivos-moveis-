import { API_CONFIG, request, USE_MOCKS } from './api';
import type { Payment, PaymentStatus } from '@/types/payment';
import { payments as mockPayments } from '@/mocks/payments';

export async function listPayments(orderId?: string, status?: string): Promise<Payment[]> {
  try {
    const params = new URLSearchParams();
    if (orderId) params.append('order_id', orderId);
    if (status) params.append('status', status);
    const query = params.toString() ? `?${params.toString()}` : '';
    return await request<Payment[]>(API_CONFIG.PAYMENT_URL, `/payments${query}`);
  } catch (error) {
    if (!USE_MOCKS) throw error;
    console.warn('Falha ao listar pagamentos da API, usando mock local:', error);
    if (!orderId && !status) return mockPayments;
    return mockPayments.filter((p) => {
      if (orderId && p.orderNumber !== orderId) return false;
      if (status && p.status !== status) return false;
      return true;
    });
  }
}

export async function getPayment(id: string): Promise<Payment> {
  try {
    return await request<Payment>(API_CONFIG.PAYMENT_URL, `/payments/${id}`);
  } catch (error) {
    if (!USE_MOCKS) throw error;
    console.warn(`Falha ao obter pagamento ${id} da API, usando mock:`, error);
    const found = mockPayments.find((p) => p.id === id);
    if (found) return found;
    throw error;
  }
}

export interface PaymentCreatePayload {
  order_id: string;
  amount?: number;
  payment_method?: string;
}

export async function createPayment(data: PaymentCreatePayload): Promise<Payment> {
  return request<Payment>(API_CONFIG.PAYMENT_URL, '/payments', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function simulatePayment(paymentId: string, status: string = 'APPROVED'): Promise<Payment> {
  return request<Payment>(API_CONFIG.PAYMENT_URL, `/payments/${paymentId}/simulate`, {
    method: 'POST',
    body: JSON.stringify({ status }),
  });
}
