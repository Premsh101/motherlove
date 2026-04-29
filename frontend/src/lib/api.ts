const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5030').replace(/\/+$/, '');
const API_URL = BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL}/api`;

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('mothernest_token');
}

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'API request failed');
  }

  return data;
}

export function getUser() {
  if (typeof window === 'undefined') return null;
  const userData = localStorage.getItem('mothernest_user');
  if (!userData) return null;
  try {
    return JSON.parse(userData);
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem('mothernest_token');
  localStorage.removeItem('mothernest_user');
  window.location.href = '/login';
}

export async function login(phone: string, password: string) {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ phone, password }),
  });
  localStorage.setItem('mothernest_token', data.token);
  localStorage.setItem('mothernest_user', JSON.stringify(data.user));
  return data.user;
}
