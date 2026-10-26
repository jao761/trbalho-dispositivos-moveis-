import { API_CONFIG, request, USE_MOCKS } from './api';
import type { Quote, QuoteStatus } from '@/types/quote';
import { quotes as mockQuotes } from '@/mocks/quotes';

export async function listQuotes(status?: QuoteStatus | 'TODOS'): Promise<Quote[]> {
  try {
    const query = status && status !== 'TODOS' ? `?status=${encodeURIComponent(status)}` : '';
    return await request<Quote[]>(API_CONFIG.CORE_URL, `/quotes${query}`);
  } catch (error) {
    if (!USE_MOCKS) throw error;
    console.warn('Falha ao listar orçamentos da API, usando mock local:', error);
    if (!status || status === 'TODOS') return mockQuotes;
    return mockQuotes.filter((q) => q.status === status);
  }
}

export async function getQuote(id: string): Promise<Quote> {
  try {
    return await request<Quote>(API_CONFIG.CORE_URL, `/quotes/${id}`);
  } catch (error) {
    if (!USE_MOCKS) throw error;
    console.warn(`Falha ao obter orçamento ${id} da API, usando mock:`, error);
    const found = mockQuotes.find((q) => q.id === id);
    if (found) return found;
    throw error;
  }
}

export interface QuoteCreatePayload {
  clientId: string;
  client_id?: string;
  validUntil?: string;
  valid_until?: string;
  discount?: number;
  notes?: string;
  items: Array<{
    productId?: string;
    external_product_id?: string;
    productName: string;
    product_name?: string;
    quantity: number;
    unitPrice: number;
    unit_price?: number;
    discount?: number;
  }>;
}

export async function createQuote(data: QuoteCreatePayload): Promise<Quote> {
  return request<Quote>(API_CONFIG.CORE_URL, '/quotes', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateQuote(id: string, data: Partial<QuoteCreatePayload>): Promise<Quote> {
  return request<Quote>(API_CONFIG.CORE_URL, `/quotes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function approveQuote(id: string): Promise<Quote> {
  return request<Quote>(API_CONFIG.CORE_URL, `/quotes/${id}/approve`, {
    method: 'POST',
  });
}

export async function rejectQuote(id: string): Promise<Quote> {
  return request<Quote>(API_CONFIG.CORE_URL, `/quotes/${id}/reject`, {
    method: 'POST',
  });
}

export async function deleteQuote(id: string): Promise<void> {
  return request<void>(API_CONFIG.CORE_URL, `/quotes/${id}`, {
    method: 'DELETE',
  });
}

export async function getQuoteItems(quoteId: string): Promise<Quote['items']> {
  return request<Quote['items']>(API_CONFIG.CORE_URL, `/quotes/${quoteId}/items`);
}

export async function updateQuoteItem(
  quoteId: string,
  itemId: string,
  data: QuoteCreatePayload['items'][number]
): Promise<Quote['items'][number]> {
  return request<Quote['items'][number]>(API_CONFIG.CORE_URL, `/quotes/${quoteId}/items/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteQuoteItem(quoteId: string, itemId: string): Promise<void> {
  return request<void>(API_CONFIG.CORE_URL, `/quotes/${quoteId}/items/${itemId}`, { method: 'DELETE' });
}
