const API_BASE = '/api';

function getAccessToken() {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes('sb-') && key.includes('-auth-token')) {
        const session = JSON.parse(localStorage.getItem(key));
        return session?.access_token ?? null;
      }
    }
  } catch {
    return null;
  }
  return null;
}

export async function api(path, options = {}) {
  const token = getAccessToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
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
    throw new Error(message);
  }

  return res.json();
}
