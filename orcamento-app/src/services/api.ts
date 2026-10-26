type ApiErrorBody = { detail?: string | Array<{ msg?: string }> };

const missingUrl = 'A URL da API não foi configurada. Defina EXPO_PUBLIC_*_API_URL com o IP LAN do computador.';

export const API_CONFIG = {
  CORE_URL: process.env.EXPO_PUBLIC_CORE_API_URL || '',
  ORDER_URL: process.env.EXPO_PUBLIC_ORDER_API_URL || '',
  PAYMENT_URL: process.env.EXPO_PUBLIC_PAYMENT_API_URL || '',
  PRODUCT_URL: process.env.EXPO_PUBLIC_PRODUCT_API_URL || '',
};

export const USE_MOCKS = process.env.EXPO_PUBLIC_USE_MOCKS === 'true';

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

export interface RequestOptions extends RequestInit {
  timeoutMs?: number;
}

export async function request<T>(baseUrl: string, endpoint: string, options: RequestOptions = {}): Promise<T> {
  if (!baseUrl) throw new Error(missingUrl);
  const url = `${baseUrl.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (authToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs || 10000);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorDetail = `Erro HTTP ${response.status}`;
      try {
        const errorJson = (await response.json()) as ApiErrorBody;
        if (typeof errorJson.detail === 'string') {
          errorDetail = errorJson.detail;
        } else if (Array.isArray(errorJson.detail)) {
          errorDetail = errorJson.detail.map((detail) => detail.msg || 'Campo inválido').join(', ');
        }
      } catch {
        // Ignora falha de parse JSON
      }
      throw new Error(errorDetail);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return (await response.json()) as T;
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('A requisição expirou (timeout). Verifique se as APIs estão em execução.');
    }
    throw error;
  }
}
