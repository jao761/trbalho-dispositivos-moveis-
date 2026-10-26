import { API_CONFIG, request, USE_MOCKS } from './api';
import type { Order, OrderStatus } from '@/types/order';
import { orders as mockOrders } from '@/mocks/orders';

export async function listOrders(status?: string): Promise<Order[]> {
  try {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return await request<Order[]>(API_CONFIG.ORDER_URL, `/orders${query}`);
  } catch (error) {
    if (!USE_MOCKS) throw error;
    console.warn('Falha ao listar pedidos da API, usando mock local:', error);
    if (!status) return mockOrders;
    return mockOrders.filter((o) => o.status === status);
  }
}

export async function getOrder(id: string): Promise<Order> {
  try {
    return await request<Order>(API_CONFIG.ORDER_URL, `/orders/${id}`);
  } catch (error) {
    if (!USE_MOCKS) throw error;
    console.warn(`Falha ao obter pedido ${id} da API, usando mock:`, error);
    const found = mockOrders.find((o) => o.id === id);
    if (found) return found;
    throw error;
  }
}

export async function createOrderFromQuote(quoteId: string): Promise<Order> {
  return request<Order>(API_CONFIG.ORDER_URL, `/orders/from-quote/${quoteId}`, {
    method: 'POST',
  });
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
  return request<Order>(API_CONFIG.ORDER_URL, `/orders/${orderId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}
