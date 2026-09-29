import { API_CONFIG, request, USE_MOCKS } from './api';
import type { DashboardData } from '@/types/dashboard';
import { dashboardData as mockDashboardData } from '@/mocks/dashboard';

export async function getDashboardData(): Promise<DashboardData> {
  try {
    return await request<DashboardData>(API_CONFIG.CORE_URL, '/dashboard');
  } catch (error) {
    if (!USE_MOCKS) throw error;
    console.warn('Falha ao carregar dashboard da API, usando mock local:', error);
    return mockDashboardData;
  }
}
