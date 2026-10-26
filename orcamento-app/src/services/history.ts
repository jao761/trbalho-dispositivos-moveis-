import { API_CONFIG, request, USE_MOCKS } from './api';
import { activityItems as mockActivityItems } from '@/mocks/activity';

export interface HistoryItem {
  id: string;
  date: string;
  title: string;
  detail: string;
  tone: 'primary' | 'success' | 'warning';
}

export async function getHistory(): Promise<HistoryItem[]> {
  try {
    return await request<HistoryItem[]>(API_CONFIG.CORE_URL, '/history');
  } catch (error) {
    if (!USE_MOCKS) throw error;
    console.warn('Falha ao obter histórico da API, usando mock:', error);
    return mockActivityItems as HistoryItem[];
  }
}
