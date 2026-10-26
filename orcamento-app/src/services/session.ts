import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import { request, API_CONFIG, setAuthToken } from './api';
import type { User } from '@/types/user';
import type { Company } from '@/types/company';
const SESSION_KEY = 'orcamento-app.session.v1';

type StoredSession = { token: string; user: User; company: Company };

let activeUser: User | null = null;
let activeCompany: Company | null = null;
const listeners: Array<() => void> = [];

export function getActiveUser(): User | null {
  return activeUser;
}

export function getActiveCompany(): Company | null {
  return activeCompany;
}

export async function setSession(token: string, user: User, company: Company) {
  setAuthToken(token);
  activeUser = user;
  activeCompany = company;
  if (Platform.OS !== 'web') {
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify({ token, user, company }));
  }
  notifyListeners();
}

export async function clearSession() {
  setAuthToken(null);
  activeUser = null;
  activeCompany = null;
  if (Platform.OS !== 'web') {
    await SecureStore.deleteItemAsync(SESSION_KEY);
  }
  notifyListeners();
}

export async function restoreSession(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const raw = await SecureStore.getItemAsync(SESSION_KEY);
  if (!raw) return false;
  try {
    const stored = JSON.parse(raw) as StoredSession;
    setAuthToken(stored.token);
    const validated = await request<{ token: string; user: User; company: Company }>(API_CONFIG.CORE_URL, '/auth/me');
    await setSession(validated.token || stored.token, validated.user, validated.company);
    return true;
  } catch {
    await clearSession();
    return false;
  }
}

export function subscribeSession(callback: () => void) {
  listeners.push(callback);
  return () => {
    const idx = listeners.indexOf(callback);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}

function notifyListeners() {
  for (const listener of listeners) {
    try {
      listener();
    } catch (e) {
      console.warn('Erro ao notificar ouvinte de sessão:', e);
    }
  }
}
