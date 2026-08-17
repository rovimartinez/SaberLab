const API_BASE = '/api';

export const TOKEN_KEY = 'saberlab-token';

function getAccessToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* sin soporte de storage */
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* sin soporte de storage */
  }
}

export function getToken() {
  return getAccessToken();
}

async function request(path, options = {}) {
  const token = getAccessToken();
  const body = typeof options.body === 'object' && options.body !== null
    ? JSON.stringify(options.body)
    : options.body;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    body,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    let message = `Error ${res.status}`;
    try {
      const body = await res.json();
      message = body.error || message;
    } catch {
      /* respuesta no JSON */
    }
    return { data: null, error: { message } };
  }

  return { data: await res.json(), error: null };
}

export function api(path, options = {}) {
  return request(path, options);
}

export async function apiData(path, options = {}) {
  const { data, error } = await request(path, options);
  if (error) throw error;
  return data;
}
