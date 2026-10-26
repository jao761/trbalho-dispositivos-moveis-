import { API_CONFIG, request } from './api';
import { setSession, clearSession } from './session';
import type { User } from '@/types/user';
import type { Company } from '@/types/company';

export interface AuthResponse {
  token: string;
  token_type: string;
  user: User;
  company: Company;
}

export async function login(payload: { usernameOrEmail: string; password: string }): Promise<AuthResponse> {
  const data = await request<AuthResponse>(API_CONFIG.CORE_URL, '/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (data?.token && data?.user && data?.company) {
    await setSession(data.token, data.user, data.company);
  }

  return data;
}

export async function register(payload: {
  name: string;
  email: string;
  password: string;
  passwordConfirmation?: string;
  company_name?: string;
}): Promise<AuthResponse> {
  const data = await request<AuthResponse>(API_CONFIG.CORE_URL, '/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (data?.token && data?.user && data?.company) {
    await setSession(data.token, data.user, data.company);
  }

  return data;
}

export async function getMe(): Promise<{ user: User; company: Company }> {
  return request<{ user: User; company: Company }>(API_CONFIG.CORE_URL, '/auth/me');
}

export async function logout() {
  await clearSession();
}
