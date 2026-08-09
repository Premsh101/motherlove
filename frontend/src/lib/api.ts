// Defaults to the frontend's own origin: next.config.ts proxies /api through to
// the backend, so nothing needs to know a public backend URL. Set
// NEXT_PUBLIC_API_URL at build time to call a backend origin directly instead
// (with or without the /api suffix — both are accepted).
const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '');
export const API_URL = BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL}/api`;

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

/**
 * Upload a document. Kept here so the multipart request shares the same base
 * URL and auth handling as every other call — Content-Type is deliberately left
 * unset so the browser adds the multipart boundary.
 */
export async function uploadDocument(
  file: File,
  patientId: string,
  type: string = 'other'
): Promise<unknown> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('patientId', patientId);
  formData.append('type', type);

  const token = getToken();

  const res = await fetch(`${API_URL}/documents/upload`, {
    method: 'POST',
    body: formData,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || 'Upload failed');
  }

  return data;
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
