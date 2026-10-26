import { API_CONFIG, request, USE_MOCKS } from './api';
import type { Client } from '@/types/client';
import type { Quote } from '@/types/quote';
import { clients as mockClients } from '@/mocks/clients';

export async function listClients(search?: string): Promise<Client[]> {
  try {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return await request<Client[]>(API_CONFIG.CORE_URL, `/clients${query}`);
  } catch (error) {
    if (!USE_MOCKS) throw error;
    console.warn('Falha ao listar clientes da API, usando mock local:', error);
    if (!search) return mockClients;
    const term = search.toLowerCase();
    return mockClients.filter(
      (c) => c.name.toLowerCase().includes(term) || c.email.toLowerCase().includes(term)
    );
  }
}

export async function getClient(id: string): Promise<Client> {
  try {
    return await request<Client>(API_CONFIG.CORE_URL, `/clients/${id}`);
  } catch (error) {
    if (!USE_MOCKS) throw error;
    console.warn(`Falha ao obter cliente ${id} da API, usando mock:`, error);
    const found = mockClients.find((c) => c.id === id);
    if (found) return found;
    throw error;
  }
}

export interface ClientCreatePayload {
  name: string;
  document?: string;
  cpf_cnpj?: string;
  email?: string;
  phone?: string;
  address?: string;
  number?: string;
  complement?: string;
  city?: string;
  state?: string;
}

export async function createClient(data: ClientCreatePayload): Promise<Client> {
  return request<Client>(API_CONFIG.CORE_URL, '/clients', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateClient(id: string, data: Partial<ClientCreatePayload>): Promise<Client> {
  return request<Client>(API_CONFIG.CORE_URL, `/clients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteClient(id: string): Promise<void> {
  return request<void>(API_CONFIG.CORE_URL, `/clients/${id}`, {
    method: 'DELETE',
  });
}

export async function getClientQuotes(clientId: string): Promise<Quote[]> {
  return request<Quote[]>(API_CONFIG.CORE_URL, `/clients/${clientId}/quotes`);
}
